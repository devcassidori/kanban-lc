// Global variables
let tasks = JSON.parse(localStorage.getItem('kanbanTasks')) || [];
let taskIdCounter = parseInt(localStorage.getItem('taskIdCounter')) || 1;
let draggedTask = null;
let isEditMode = false;
let editingTaskId = null;

// Filter variables
let currentFilters = {
    priority: '',
    assignee: ''
};

// Theme variable
let currentTheme = localStorage.getItem('kanbanTheme') || 'default';

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    loadTasks();
    updateTaskCounts();
    populateAssigneeFilter();
    initializeTheme();

    // Form submission
    document.getElementById('taskForm').addEventListener('submit', function (e) {
        e.preventDefault();

        if (isEditMode && editingTaskId) {
            updateTask(editingTaskId);
        } else {
            createTask();
        }
    });

    // Close modal when clicking outside
    document.getElementById('taskModal').addEventListener('click', function (e) {
        if (e.target === this) {
            closeModal();
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeModal();
        }
        if (e.key === 'n' && e.ctrlKey) {
            e.preventDefault();
            openModal();
        }
    });
});

// Task Management Functions
function createTask() {
    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    const priority = document.getElementById('taskPriority').value;
    const assignee = document.getElementById('taskAssignee').value.trim();

    if (!title) {
        alert('Por favor, insira um título para a tarefa.');
        return;
    }

    const task = {
        id: taskIdCounter++,
        title: title,
        description: description,
        priority: priority,
        assignee: assignee,
        status: 'todo',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    tasks.push(task);
    saveTasks();
    renderTask(task);
    updateTaskCounts();
    populateAssigneeFilter(); // Update assignee filter with new assignee
    applyFilters(); // Apply current filters to show/hide tasks
    closeModal();
    resetForm();

    // Show success animation
    showNotification('Tarefa criada com sucesso!', 'success');
}

function deleteTask(taskId) {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks();
        document.querySelector(`[data-task-id="${taskId}"]`).remove();
        updateTaskCounts();
        populateAssigneeFilter(); // Update assignee filter
        applyFilters(); // Apply current filters
        showNotification('Tarefa excluída com sucesso!', 'success');
    }
}

function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Set edit mode
    isEditMode = true;
    editingTaskId = taskId;

    // Populate modal with task data
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDescription').value = task.description;
    document.getElementById('taskPriority').value = task.priority;
    document.getElementById('taskAssignee').value = task.assignee;

    // Change modal title
    document.querySelector('.modal-header h3').textContent = 'Editar Tarefa';
    document.querySelector('.btn-primary').textContent = 'Salvar Alterações';

    openModal();
}

function updateTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    const priority = document.getElementById('taskPriority').value;
    const assignee = document.getElementById('taskAssignee').value.trim();

    if (!title) {
        alert('Por favor, insira um título para a tarefa.');
        return;
    }

    // Update task data
    task.title = title;
    task.description = description;
    task.priority = priority;
    task.assignee = assignee;
    task.updatedAt = new Date().toISOString();

    saveTasks();

    // Update the existing task element instead of creating a new one
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    if (taskElement) {
        // Update the task element content
        updateTaskElement(taskElement, task);
    }

    updateTaskCounts();
    populateAssigneeFilter(); // Update assignee filter
    applyFilters(); // Apply current filters
    closeModal();

    showNotification('Tarefa atualizada com sucesso!', 'success');
}

// Rendering Functions
function loadTasks() {
    // Clear existing tasks
    document.getElementById('todo-tasks').innerHTML = '';
    document.getElementById('doing-tasks').innerHTML = '';
    document.getElementById('done-tasks').innerHTML = '';

    // Render all tasks
    tasks.forEach(task => renderTask(task));

    // Add empty states if no tasks
    addEmptyStates();

    // Apply current filters
    if (currentFilters.priority || currentFilters.assignee) {
        applyFilters();
    }
}

function renderTask(task) {
    const taskElement = createTaskElement(task);
    const container = document.getElementById(`${task.status}-tasks`);

    // Remove empty state if it exists
    const emptyState = container.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }

    container.appendChild(taskElement);
}

function createTaskElement(task) {
    const taskDiv = document.createElement('div');
    taskDiv.className = `task-card priority-${task.priority}`;
    taskDiv.draggable = true;
    taskDiv.setAttribute('data-task-id', task.id);

    taskDiv.innerHTML = `
        <div class="task-header">
            <div class="task-title">${escapeHtml(task.title)}</div>
            <div class="task-actions">
                <button class="edit-btn" onclick="editTask(${task.id})" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" onclick="deleteTask(${task.id})" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
        <div class="task-meta">
            <span class="task-priority priority-${task.priority}">
                ${getPriorityText(task.priority)}
            </span>
            ${task.assignee ? `
                <span class="task-assignee">
                    <i class="fas fa-user"></i>
                    ${escapeHtml(task.assignee)}
                </span>
            ` : ''}
        </div>
    `;

    // Add drag event listeners
    taskDiv.addEventListener('dragstart', handleDragStart);
    taskDiv.addEventListener('dragend', handleDragEnd);

    return taskDiv;
}

function updateTaskElement(taskElement, task) {
    // Update the task element's classes
    taskElement.className = `task-card priority-${task.priority}`;

    // Update the inner HTML with new task data
    taskElement.innerHTML = `
        <div class="task-header">
            <div class="task-title">${escapeHtml(task.title)}</div>
            <div class="task-actions">
                <button class="edit-btn" onclick="editTask(${task.id})" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" onclick="deleteTask(${task.id})" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
        <div class="task-meta">
            <span class="task-priority priority-${task.priority}">
                ${getPriorityText(task.priority)}
            </span>
            ${task.assignee ? `
                <span class="task-assignee">
                    <i class="fas fa-user"></i>
                    ${escapeHtml(task.assignee)}
                </span>
            ` : ''}
        </div>
    `;

    // Re-add drag event listeners since innerHTML was replaced
    taskElement.addEventListener('dragstart', handleDragStart);
    taskElement.addEventListener('dragend', handleDragEnd);
}

function addEmptyStates() {
    const columns = ['todo', 'doing', 'done'];
    const messages = {
        'todo': 'Nenhuma tarefa pendente',
        'doing': 'Nenhuma tarefa em andamento',
        'done': 'Nenhuma tarefa concluída'
    };
    const icons = {
        'todo': 'fas fa-clipboard-list',
        'doing': 'fas fa-clock',
        'done': 'fas fa-check-circle'
    };

    columns.forEach(status => {
        const container = document.getElementById(`${status}-tasks`);
        if (container.children.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <i class="${icons[status]}"></i>
                <p>${messages[status]}</p>
            `;
            container.appendChild(emptyState);
        }
    });
}

// Drag and Drop Functions
function handleDragStart(e) {
    draggedTask = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.outerHTML);
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    draggedTask = null;
}

function allowDrop(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    // Add visual feedback
    const container = e.currentTarget;
    container.classList.add('drag-over');

    // Remove drag-over class after a short delay
    setTimeout(() => {
        container.classList.remove('drag-over');
    }, 100);
}

function drop(e) {
    e.preventDefault();

    if (!draggedTask) return;

    const container = e.currentTarget;
    const newStatus = getStatusFromContainer(container);
    const taskId = parseInt(draggedTask.getAttribute('data-task-id'));

    // Update task status
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== newStatus) {
        task.status = newStatus;
        task.updatedAt = new Date().toISOString();
        saveTasks();

        // Move the task element to the new container
        const emptyState = container.querySelector('.empty-state');
        if (emptyState) {
            emptyState.remove();
        }

        container.appendChild(draggedTask);
        updateTaskCounts();
        applyFilters(); // Apply filters to maintain filter state
        addEmptyStates();

        showNotification(`Tarefa movida para "${getStatusText(newStatus)}"`, 'success');
    }

    container.classList.remove('drag-over');
}

function getStatusFromContainer(container) {
    const id = container.id;
    if (id.includes('todo')) return 'todo';
    if (id.includes('doing')) return 'doing';
    if (id.includes('done')) return 'done';
    return 'todo';
}

function getStatusText(status) {
    const statusTexts = {
        'todo': 'A Fazer',
        'doing': 'Fazendo',
        'done': 'Feito'
    };
    return statusTexts[status] || status;
}

// Modal Functions
function openModal() {
    // If not in edit mode, reset the form
    if (!isEditMode) {
        resetForm();
    }
    document.getElementById('taskModal').style.display = 'block';
    document.getElementById('taskTitle').focus();
}

function closeModal() {
    document.getElementById('taskModal').style.display = 'none';
    // Reset form after modal is closed
    setTimeout(() => {
        resetForm();
    }, 100);
}

function resetForm() {
    const form = document.getElementById('taskForm');
    form.reset();

    // Reset edit mode
    isEditMode = false;
    editingTaskId = null;

    // Reset modal appearance
    document.querySelector('.modal-header h3').textContent = 'Nova Tarefa';
    document.querySelector('.btn-primary').textContent = 'Criar Tarefa';
}

// Utility Functions
function updateTaskCounts() {
    const counts = {
        todo: tasks.filter(t => t.status === 'todo').length,
        doing: tasks.filter(t => t.status === 'doing').length,
        done: tasks.filter(t => t.status === 'done').length
    };

    document.querySelector('[data-status="todo"] .task-count').textContent = counts.todo;
    document.querySelector('[data-status="doing"] .task-count').textContent = counts.doing;
    document.querySelector('[data-status="done"] .task-count').textContent = counts.done;
}

function getPriorityText(priority) {
    const priorities = {
        'low': 'Baixa',
        'medium': 'Média',
        'high': 'Alta'
    };
    return priorities[priority] || priority;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Filter Functions
function populateAssigneeFilter() {
    const assigneeFilter = document.getElementById('assigneeFilter');
    const currentValue = assigneeFilter.value;

    // Get unique assignees from tasks
    const assignees = [...new Set(tasks
        .map(task => task.assignee)
        .filter(assignee => assignee && assignee.trim() !== '')
    )].sort();

    // Clear current options except the first one
    assigneeFilter.innerHTML = '<option value="">Todos os responsáveis</option>';

    // Add options for each unique assignee
    assignees.forEach(assignee => {
        const option = document.createElement('option');
        option.value = assignee;
        option.textContent = assignee;
        assigneeFilter.appendChild(option);
    });

    // Restore the previously selected value if it still exists
    if (currentValue && assignees.includes(currentValue)) {
        assigneeFilter.value = currentValue;
    }
}

function applyFilters() {
    const priorityFilter = document.getElementById('priorityFilter').value;
    const assigneeFilter = document.getElementById('assigneeFilter').value;

    // Update current filters
    currentFilters.priority = priorityFilter;
    currentFilters.assignee = assigneeFilter;

    let visibleTasksCount = 0;
    let totalTasksCount = tasks.length;

    // Get all task elements
    const taskElements = document.querySelectorAll('.task-card');

    taskElements.forEach(taskElement => {
        const taskId = parseInt(taskElement.getAttribute('data-task-id'));
        const task = tasks.find(t => t.id === taskId);

        if (!task) return;

        let shouldShow = true;

        // Apply priority filter
        if (priorityFilter && task.priority !== priorityFilter) {
            shouldShow = false;
        }

        // Apply assignee filter
        if (assigneeFilter && task.assignee !== assigneeFilter) {
            shouldShow = false;
        }

        // Show or hide the task
        if (shouldShow) {
            taskElement.style.display = 'block';
            taskElement.style.animation = 'taskSlideIn 0.3s ease';
            visibleTasksCount++;
        } else {
            taskElement.style.display = 'none';
        }
    });

    // Update filter stats
    updateFilterStats(visibleTasksCount, totalTasksCount);

    // Update task counts for visible tasks only
    updateTaskCountsWithFilters();

    // Update empty states
    updateEmptyStatesWithFilters();
}

function clearFilters() {
    // Reset filter controls
    document.getElementById('priorityFilter').value = '';
    document.getElementById('assigneeFilter').value = '';

    // Reset current filters
    currentFilters.priority = '';
    currentFilters.assignee = '';

    // Show all tasks
    const taskElements = document.querySelectorAll('.task-card');
    taskElements.forEach(taskElement => {
        taskElement.style.display = 'block';
        taskElement.style.animation = 'taskSlideIn 0.3s ease';
    });

    // Update displays
    updateFilterStats(tasks.length, tasks.length);
    updateTaskCounts();
    addEmptyStates();

    showNotification('Filtros limpos', 'success');
}

function updateFilterStats(visibleCount, totalCount) {
    const filterStats = document.getElementById('filterStats');

    if (visibleCount === totalCount) {
        filterStats.innerHTML = `<i class="fas fa-info-circle"></i> Mostrando todas as ${totalCount} tarefas`;
    } else {
        filterStats.innerHTML = `<i class="fas fa-filter"></i> Mostrando ${visibleCount} de ${totalCount} tarefas`;
    }
}

function updateTaskCountsWithFilters() {
    const counts = {
        todo: 0,
        doing: 0,
        done: 0
    };

    // Count only visible tasks
    const visibleTasks = document.querySelectorAll('.task-card[style*="display: block"], .task-card:not([style*="display: none"])');

    visibleTasks.forEach(taskElement => {
        const taskId = parseInt(taskElement.getAttribute('data-task-id'));
        const task = tasks.find(t => t.id === taskId);

        if (task && taskElement.style.display !== 'none') {
            counts[task.status]++;
        }
    });

    // Update the display
    document.querySelector('[data-status="todo"] .task-count').textContent = counts.todo;
    document.querySelector('[data-status="doing"] .task-count').textContent = counts.doing;
    document.querySelector('[data-status="done"] .task-count').textContent = counts.done;
}

function updateEmptyStatesWithFilters() {
    const columns = ['todo', 'doing', 'done'];

    columns.forEach(status => {
        const container = document.getElementById(`${status}-tasks`);
        const visibleTasks = container.querySelectorAll('.task-card[style*="display: block"], .task-card:not([style*="display: none"])');
        const emptyState = container.querySelector('.empty-state');

        if (visibleTasks.length === 0) {
            if (!emptyState) {
                const isFiltered = currentFilters.priority || currentFilters.assignee;
                const messages = {
                    'todo': isFiltered ? 'Nenhuma tarefa pendente com os filtros atuais' : 'Nenhuma tarefa pendente',
                    'doing': isFiltered ? 'Nenhuma tarefa em andamento com os filtros atuais' : 'Nenhuma tarefa em andamento',
                    'done': isFiltered ? 'Nenhuma tarefa concluída com os filtros atuais' : 'Nenhuma tarefa concluída'
                };
                const icons = {
                    'todo': 'fas fa-clipboard-list',
                    'doing': 'fas fa-clock',
                    'done': 'fas fa-check-circle'
                };

                const newEmptyState = document.createElement('div');
                newEmptyState.className = 'empty-state';
                newEmptyState.innerHTML = `
                    <i class="${icons[status]}"></i>
                    <p>${messages[status]}</p>
                `;
                container.appendChild(newEmptyState);
            }
        } else {
            if (emptyState) {
                emptyState.remove();
            }
        }
    });
}

// Theme Functions
function initializeTheme() {
    // Set the saved theme
    applyTheme(currentTheme);

    // Set the theme selector value
    document.getElementById('themeSelect').value = currentTheme;
}

function changeTheme(themeName) {
    currentTheme = themeName;
    applyTheme(themeName);
    saveTheme(themeName);
    showNotification(`Tema alterado para "${getThemeDisplayName(themeName)}"`, 'success');
}

function applyTheme(themeName) {
    // Remove existing theme attributes
    document.body.removeAttribute('data-theme');

    // Apply new theme
    if (themeName !== 'default') {
        document.body.setAttribute('data-theme', themeName);
    }

    // Add smooth transition for theme change
    document.body.style.transition = 'all 0.3s ease';
    setTimeout(() => {
        document.body.style.transition = '';
    }, 300);
}

function saveTheme(themeName) {
    localStorage.setItem('kanbanTheme', themeName);
}

function getThemeDisplayName(themeName) {
    const themeNames = {
        'default': 'Padrão',
        'dark': 'Escuro',
        'ocean': 'Oceano',
        'sunset': 'Pôr do Sol',
        'forest': 'Floresta',
        'minimal': 'Minimalista'
    };
    return themeNames[themeName] || themeName;
}

function saveTasks() {
    localStorage.setItem('kanbanTasks', JSON.stringify(tasks));
    localStorage.setItem('taskIdCounter', taskIdCounter.toString());
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#48bb78' : '#4299e1'};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        z-index: 1001;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
        font-weight: 500;
    `;

    // Add animation keyframes
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideInRight {
                from {
                    opacity: 0;
                    transform: translateX(100%);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            @keyframes slideOutRight {
                from {
                    opacity: 1;
                    transform: translateX(0);
                }
                to {
                    opacity: 0;
                    transform: translateX(100%);
                }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Export/Import Functions
function exportData() {
    document.getElementById('exportModal').style.display = 'block';
}

function closeExportModal() {
    document.getElementById('exportModal').style.display = 'none';
}

function downloadJSON() {
    const exportData = {
        tasks: tasks,
        exportDate: new Date().toISOString(),
        version: "1.0.0",
        totalTasks: tasks.length,
        tasksByStatus: {
            todo: tasks.filter(t => t.status === 'todo').length,
            doing: tasks.filter(t => t.status === 'doing').length,
            done: tasks.filter(t => t.status === 'done').length
        }
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `kanban-backup-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    closeExportModal();
    showNotification('Dados exportados em JSON com sucesso!', 'success');
}

function downloadCSV() {
    if (tasks.length === 0) {
        showNotification('Nenhuma tarefa para exportar', 'error');
        return;
    }

    // CSV Headers
    const headers = ['ID', 'Título', 'Descrição', 'Prioridade', 'Responsável', 'Status', 'Data Criação', 'Última Atualização'];

    // Convert tasks to CSV format
    const csvContent = [
        headers.join(','),
        ...tasks.map(task => [
            `"${task.id}"`,
            `"${task.title.replace(/"/g, '""')}"`,
            `"${(task.description || '').replace(/"/g, '""')}"`,
            `"${getPriorityLabel(task.priority)}"`,
            `"${task.assignee || ''}"`,
            `"${getStatusLabel(task.status)}"`,
            `"${formatDateForCSV(task.createdAt)}"`,
            `"${formatDateForCSV(task.updatedAt)}"`
        ].join(','))
    ].join('\n');

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `kanban-tasks-${new Date().toISOString().split('T')[0]}.csv`);
    link.click();

    URL.revokeObjectURL(url);
    closeExportModal();
    showNotification('Dados exportados em CSV com sucesso!', 'success');
}

function getPriorityLabel(priority) {
    const labels = {
        'high': 'Alta',
        'medium': 'Média',
        'low': 'Baixa'
    };
    return labels[priority] || priority;
}

function getStatusLabel(status) {
    const labels = {
        'todo': 'A Fazer',
        'doing': 'Fazendo',
        'done': 'Feito'
    };
    return labels[status] || status;
}

function formatDateForCSV(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (fileExtension === 'json') {
        importJSON(file);
    } else if (fileExtension === 'csv') {
        importCSV(file);
    } else {
        showNotification('Formato de arquivo não suportado. Use JSON ou CSV.', 'error');
    }

    // Clear the input for next use
    event.target.value = '';
}

function importJSON(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const importedData = JSON.parse(e.target.result);

            // Check if it's the new format with metadata
            let importedTasks;
            if (importedData.tasks && Array.isArray(importedData.tasks)) {
                importedTasks = importedData.tasks;
            } else if (Array.isArray(importedData)) {
                // Old format - direct array of tasks
                importedTasks = importedData;
            } else {
                throw new Error('Formato JSON inválido');
            }

            // Validate task structure
            const validTasks = importedTasks.filter(task =>
                task.id && task.title && task.status &&
                ['todo', 'doing', 'done'].includes(task.status)
            );

            if (validTasks.length === 0) {
                throw new Error('Nenhuma tarefa válida encontrada');
            }

            // Confirm import if it will replace existing tasks
            if (tasks.length > 0) {
                const confirmed = confirm(
                    `Você tem ${tasks.length} tarefa(s) existente(s). ` +
                    `Importar ${validTasks.length} tarefa(s) irá substituir todas as tarefas atuais. ` +
                    `Deseja continuar?`
                );
                if (!confirmed) return;
            }

            tasks = validTasks;
            saveTasks();
            loadTasks();
            updateTaskCounts();
            updateFilterOptions();

            showNotification(
                `${validTasks.length} tarefa(s) importada(s) com sucesso!`,
                'success'
            );

        } catch (error) {
            console.error('Erro ao importar JSON:', error);
            showNotification(
                'Erro ao importar JSON. Verifique se o arquivo está no formato correto.',
                'error'
            );
        }
    };
    reader.readAsText(file);
}

function importCSV(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const csvContent = e.target.result;
            const lines = csvContent.split('\n').filter(line => line.trim());

            if (lines.length < 2) {
                throw new Error('Arquivo CSV deve ter pelo menos um cabeçalho e uma linha de dados');
            }

            // Parse CSV (simple implementation - doesn't handle all CSV edge cases)
            const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
            const rows = lines.slice(1);

            const importedTasks = [];

            rows.forEach((row, index) => {
                try {
                    // Simple CSV parsing - split by comma and remove quotes
                    const values = row.split(',').map(v => v.replace(/^"|"$/g, '').trim());

                    if (values.length < headers.length) return; // Skip incomplete rows

                    const task = {
                        id: values[0] || `imported_${Date.now()}_${index}`,
                        title: values[1] || `Tarefa Importada ${index + 1}`,
                        description: values[2] || '',
                        priority: convertPriorityFromLabel(values[3]) || 'medium',
                        assignee: values[4] || '',
                        status: convertStatusFromLabel(values[5]) || 'todo',
                        createdAt: values[6] ? new Date(values[6]).toISOString() : new Date().toISOString(),
                        updatedAt: values[7] ? new Date(values[7]).toISOString() : new Date().toISOString()
                    };

                    // Validate required fields
                    if (task.title && task.status) {
                        importedTasks.push(task);
                    }
                } catch (error) {
                    console.warn(`Erro ao processar linha ${index + 2}:`, error);
                }
            });

            if (importedTasks.length === 0) {
                throw new Error('Nenhuma tarefa válida encontrada no CSV');
            }

            // Confirm import
            if (tasks.length > 0) {
                const confirmed = confirm(
                    `Você tem ${tasks.length} tarefa(s) existente(s). ` +
                    `Importar ${importedTasks.length} tarefa(s) irá substituir todas as tarefas atuais. ` +
                    `Deseja continuar?`
                );
                if (!confirmed) return;
            }

            tasks = importedTasks;
            saveTasks();
            loadTasks();
            updateTaskCounts();
            updateFilterOptions();

            showNotification(
                `${importedTasks.length} tarefa(s) importada(s) do CSV com sucesso!`,
                'success'
            );

        } catch (error) {
            console.error('Erro ao importar CSV:', error);
            showNotification(
                'Erro ao importar CSV. Verifique o formato do arquivo.',
                'error'
            );
        }
    };
    reader.readAsText(file);
}

function convertPriorityFromLabel(label) {
    const priorities = {
        'Alta': 'high',
        'Média': 'medium',
        'Baixa': 'low',
        'High': 'high',
        'Medium': 'medium',
        'Low': 'low'
    };
    return priorities[label] || 'medium';
}

function convertStatusFromLabel(label) {
    const statuses = {
        'A Fazer': 'todo',
        'Fazendo': 'doing',
        'Feito': 'done',
        'To Do': 'todo',
        'Doing': 'doing',
        'Done': 'done',
        'TODO': 'todo',
        'DOING': 'doing',
        'DONE': 'done'
    };
    return statuses[label] || 'todo';
}

// Close export modal when clicking outside
window.onclick = function (event) {
    const exportModal = document.getElementById('exportModal');
    const shortcutsModal = document.getElementById('shortcutsModal');

    if (event.target === exportModal) {
        closeExportModal();
    }

    if (event.target === shortcutsModal) {
        closeShortcutsModal();
    }
}

// Keyboard shortcuts info
function showKeyboardShortcuts() {
    document.getElementById('shortcutsModal').style.display = 'block';
}

function closeShortcutsModal() {
    document.getElementById('shortcutsModal').style.display = 'none';
}

// Performance optimization: Use requestAnimationFrame for smooth animations
function smoothUpdateTaskCounts() {
    requestAnimationFrame(updateTaskCounts);
}

// Initialize smooth scroll behavior
document.documentElement.style.scrollBehavior = 'smooth';
