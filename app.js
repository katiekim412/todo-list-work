// 요소 선택
const taskText = document.getElementById('task-text'); // 할 일 입력창 요소를 가져옴
const taskAssignedTo = document.getElementById('task-assigned-to'); // 담당자 입력창 요소를 가져옴
const taskPriority = document.getElementById('task-priority'); // 우선순위 선택창 요소를 가져옴
const addTaskBtn = document.getElementById('add-task-btn'); // 할 일 추가 버튼 요소를 가져옴
const taskList = document.getElementById('task-list'); // 할 일 목록(ul) 요소를 가져옴
const themeToggle = document.getElementById('theme-toggle'); // 테마 토글 버튼 요소를 가져옴
const tabButtons = document.querySelectorAll('.tab-button'); // 탭 버튼들(개인/팀) 모두 선택
const filterStatus = document.getElementById('filter-status'); // 상태 필터(select) 요소를 가져옴
const filterPriority = document.getElementById('filter-priority'); // 우선순위 필터(select) 요소를 가져옴

let currentTab = 'personal'; // 현재 선택된 탭(기본값: 개인)

// localStorage에서 할 일 목록 불러오기(없으면 빈 배열)
let personalTasks = JSON.parse(localStorage.getItem('personalTasks')) || []; // 개인 할 일 목록
let teamTasks = JSON.parse(localStorage.getItem('teamTasks')) || []; // 팀 할 일 목록

// 저장된 테마 적용(페이지 로드 시)
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme'); // 저장된 테마(light/dark) 확인
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode'); // 다크 모드 클래스 추가
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>'; // 아이콘을 해 모양으로 변경
    } else {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>'; // 아이콘을 달 모양으로 변경
    }
    renderTasks(); // 할 일 목록 렌더링
});

// 다크 모드 토글 버튼 클릭 이벤트
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode'); // 다크 모드 클래스 토글
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark'); // 다크 모드로 저장
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>'; // 해 아이콘으로 변경
    } else {
        localStorage.setItem('theme', 'light'); // 라이트 모드로 저장
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>'; // 달 아이콘으로 변경
    }
});

// 탭 버튼(개인/팀) 클릭 이벤트 등록
// 각 탭 버튼에 대해 이벤트 리스너 추가
// 클릭 시 해당 탭 활성화 및 할 일 목록 렌더링
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        tabButtons.forEach(btn => btn.classList.remove('active')); // 모든 탭 비활성화
        button.classList.add('active'); // 클릭한 탭만 활성화
        currentTab = button.dataset.tab; // 현재 탭 상태 변경
        renderTasks(); // 해당 탭의 할 일 목록 렌더링
    });
});

// 할 일 추가 버튼 클릭 이벤트
addTaskBtn.addEventListener('click', () => {
    const text = taskText.value.trim(); // 입력된 할 일 텍스트(공백 제거)
    const assignedTo = taskAssignedTo.value.trim(); // 입력된 담당자(공백 제거)
    const priority = taskPriority.value; // 선택된 우선순위 값

    if (text === '') { // 할 일 내용이 비어있으면
        alert('할 일을 입력해주세요!'); // 경고창 표시
        return; // 함수 종료
    }

    // 새 할 일 객체 생성
    const newTask = {
        id: Date.now(), // 고유 ID(타임스탬프)
        text: text, // 할 일 내용
        assignedTo: assignedTo, // 담당자
        priority: priority, // 우선순위
        completed: false, // 완료 여부(초기값: 미완료)
        createdAt: new Date().toLocaleString() // 생성 시각(로컬 문자열)
    };

    // 현재 탭에 따라 개인/팀 할 일 배열에 추가 및 저장
    if (currentTab === 'personal') {
        personalTasks.push(newTask); // 개인 할 일에 추가
        localStorage.setItem('personalTasks', JSON.stringify(personalTasks)); // localStorage에 저장
    } else {
        teamTasks.push(newTask); // 팀 할 일에 추가
        localStorage.setItem('teamTasks', JSON.stringify(teamTasks)); // localStorage에 저장
    }

    // 입력창 초기화
    taskText.value = '';
    taskAssignedTo.value = '';
    taskPriority.value = 'medium';
    renderTasks(); // 할 일 목록 다시 렌더링
});

// 할 일 목록 렌더링 함수
function renderTasks() {
    taskList.innerHTML = ''; // 기존 목록 비우기

    // 현재 탭에 따라 렌더링할 할 일 배열 선택
    let tasksToRender = currentTab === 'personal' ? personalTasks : teamTasks;

    // 필터 값 가져오기
    const statusFilter = filterStatus.value; // 상태 필터 값
    const priorityFilter = filterPriority.value; // 우선순위 필터 값

    // 필터 조건에 맞는 할 일만 남김
    tasksToRender = tasksToRender.filter(task => {
        const matchesStatus = statusFilter === 'all' ||
                              (statusFilter === 'active' && !task.completed) ||
                              (statusFilter === 'completed' && task.completed); // 상태 필터 조건
        const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter; // 우선순위 필터 조건
        return matchesStatus && matchesPriority; // 둘 다 만족해야 표시
    });

    // 우선순위(높음>보통>낮음), 생성일(최신순) 정렬
    tasksToRender.sort((a, b) => {
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 }; // 우선순위별 정렬 기준
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]; // 우선순위 비교
        if (priorityDiff !== 0) {
            return priorityDiff; // 우선순위가 다르면 우선순위로 정렬
        }
        return b.id - a.id; // 같으면 생성일(최신순) 정렬
    });

    // 할 일이 없으면 안내 메시지 출력
    if (tasksToRender.length === 0) {
        const emptyMessage = document.createElement('li'); // 메시지용 li 생성
        emptyMessage.textContent = currentTab === 'personal' ? "아직 개인 할 일이 없어요!" : "아직 팀 할 일이 없어요!"; // 메시지 내용
        emptyMessage.style.textAlign = 'center'; // 가운데 정렬
        emptyMessage.style.padding = '20px'; // 패딩
        emptyMessage.style.color = 'var(--text-color)'; // 색상
        emptyMessage.style.opacity = '0.7'; // 투명도
        taskList.appendChild(emptyMessage); // 목록에 추가
        return; // 함수 종료
    }

    // 할 일 목록을 순회하며 각 항목을 동적으로 생성
    tasksToRender.forEach(task => {
        const listItem = document.createElement('li'); // li 요소 생성
        listItem.classList.add('task-item'); // 클래스 추가
        if (task.completed) {
            listItem.classList.add('completed'); // 완료된 항목이면 클래스 추가
        }

        listItem.dataset.id = task.id; // 데이터 속성에 id 저장

        // 담당자, 우선순위, 생성일 HTML 생성
        let assignedToHtml = task.assignedTo ? `<div class="task-details">담당: ${task.assignedTo}</div>` : '';
        let priorityHtml = `<div class="task-details">우선순위: ${getPriorityText(task.priority)}</div>`;
        let createdAtHtml = `<div class="task-details">생성: ${task.createdAt}</div>`;

        // li 내용 구성(할 일 내용, 담당자, 우선순위, 생성일, 완료/삭제 버튼)
        listItem.innerHTML = `
            <div class="task-content">
                <div class="task-name">${task.text}</div>
                ${assignedToHtml}
                ${priorityHtml}
                ${createdAtHtml}
            </div>
            <div class="task-actions">
                <button class="complete-btn" title="완료/미완료 토글">
                    <i class="fas fa-check-circle"></i>
                </button>
                <button class="delete-btn" title="삭제">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
        taskList.appendChild(listItem); // 목록에 추가
    });
}

// 우선순위 텍스트 반환 함수(영문 -> 한글)
function getPriorityText(priority) {
    switch (priority) {
        case 'low': return '낮음'; // low -> 낮음
        case 'medium': return '보통'; // medium -> 보통
        case 'high': return '높음'; // high -> 높음
        default: return '';
    }
}

// 할 일 완료/삭제 버튼 클릭 이벤트(이벤트 위임)
taskList.addEventListener('click', (e) => {
    const target = e.target.closest('button'); // 클릭된 버튼 요소 찾기
    if (!target) return; // 버튼이 아니면 무시

    const listItem = target.closest('.task-item'); // 해당 할 일 li 요소 찾기
    if (!listItem) return; // 없으면 무시

    const taskId = parseInt(listItem.dataset.id); // id 추출(숫자형)
    let tasks = currentTab === 'personal' ? personalTasks : teamTasks; // 현재 탭의 할 일 배열

    if (target.classList.contains('complete-btn')) { // 완료 버튼 클릭 시
        tasks = tasks.map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task // 완료 상태 토글
        );
    } else if (target.classList.contains('delete-btn')) { // 삭제 버튼 클릭 시
        tasks = tasks.filter(task => task.id !== taskId); // 해당 할 일 삭제
    }

    // 변경된 배열을 다시 저장
    if (currentTab === 'personal') {
        personalTasks = tasks; // 개인 할 일 갱신
        localStorage.setItem('personalTasks', JSON.stringify(personalTasks)); // 저장
    } else {
        teamTasks = tasks; // 팀 할 일 갱신
        localStorage.setItem('teamTasks', JSON.stringify(teamTasks)); // 저장
    }
    renderTasks(); // 변경 후 목록 렌더링
});

// 상태/우선순위 필터 변경 시 할 일 목록 렌더링
filterStatus.addEventListener('change', renderTasks); // 상태 필터 변경 이벤트
filterPriority.addEventListener('change', renderTasks); // 우선순위 필터 변경 이벤트

// 초기 렌더링(스크립트 실행 시)
renderTasks();

// 할 일 입력창에서 엔터키 입력 시 할 일 추가
// (입력창, 담당자 입력창 모두 적용)
taskText.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTaskBtn.click(); // 추가 버튼 클릭
    }
});
taskAssignedTo.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTaskBtn.click(); // 추가 버튼 클릭
    }
});