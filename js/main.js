// 主应用程序模块
class AcademicColorApp {
    constructor() {
        this.currentView = 'main';
        this.viewHistory = [];
        this.navigationManager = new NavigationManager();
    }

    // 初始化应用程序
    async init() {
        try {
            // 显示加载状态
            this.showLoadingState();
            
            // 初始化数据管理器
            await dataManager.init();
            
            // 初始化各个模块
            uiComponents.init();
            previewTool.init();
            myPalettes.init();
            
            // 设置导航管理器
            this.navigationManager.init();
            
            // 渲染初始界面
            this.renderInitialView();
            
            // 检查URL中的分享配色
            myPalettes.loadSharedPalette();
            
            // 隐藏加载状态
            this.hideLoadingState();
            
            console.log('Academic Color App 初始化完成');
        } catch (error) {
            console.error('应用初始化失败:', error);
            this.showErrorState(error);
        }
    }

    // 显示加载状态
    showLoadingState() {
        const loadingHtml = `
            <div id="loadingState" class="fixed inset-0 bg-theme-secondary flex items-center justify-center z-50">
                <div class="text-center">
                    <div class="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 class="text-xl font-bold text-theme-primary mb-2">学术配色库</h2>
                    <p class="text-theme-secondary">正在加载数据...</p>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', loadingHtml);
    }

    // 隐藏加载状态
    hideLoadingState() {
        const loadingState = document.getElementById('loadingState');
        if (loadingState) {
            loadingState.remove();
        }
    }

    // 显示错误状态
    showErrorState(error) {
        this.hideLoadingState();
        
        const errorHtml = `
            <div id="errorState" class="fixed inset-0 bg-theme-secondary flex items-center justify-center z-50">
                <div class="text-center max-w-md mx-auto p-8">
                    <svg class="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                    <h2 class="text-xl font-bold text-theme-primary mb-2">加载失败</h2>
                    <p class="text-theme-secondary mb-4">数据加载遇到问题，请检查网络连接后重试</p>
                    <button onclick="location.reload()" class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                        重新加载
                    </button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', errorHtml);
    }

    // 渲染初始视图
    renderInitialView() {
        // 渲染侧边栏
        uiComponents.renderFieldsList();
        
        // 渲染增强版年份筛选
        uiComponents.renderYearFiltersAdvanced();
        
        // 渲染文章列表
        uiComponents.renderArticles();
        
        // 更新统计信息
        uiComponents.updateStatistics();
    }
}

// 导航管理器
class NavigationManager {
    constructor() {
        this.currentView = 'main';
        this.viewHistory = [];
    }

    init() {
        this.updateBackButton();
        window.navigationManager = this;
    }

    // 显示主视图
    showMainView() {
        if (this.currentView !== 'main') {
            this.viewHistory.push(this.currentView);
            this.updateBackButton();
        }
        
        this.currentView = 'main';
        this.hideAllViews();
        document.getElementById('mainView')?.classList.remove('hidden');
        
        // 关闭移动端菜单
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        if (sidebar && overlay) {
            sidebar.classList.remove('mobile-open');
            overlay.classList.add('hidden');
        }
    }

    // 显示预览工具视图
    showPreviewView() {
        if (this.currentView !== 'preview') {
            this.viewHistory.push(this.currentView);
            this.updateBackButton();
        }
        
        this.currentView = 'preview';
        this.hideAllViews();
        const previewView = document.getElementById('previewView');
        if (previewView) {
            previewView.classList.remove('hidden');
            
            // 更新类名以修复遮挡问题，同时保持居中
            const container = previewView.querySelector('.main-content-full');
            if (container) {
                container.className = 'main-content-with-padding centered-container';
            }
            
            // 延迟更新图表以确保容器已渲染
            setTimeout(() => previewTool.updateCharts(), 100);
        }
    }

    // 显示我的配色视图
    showMyPalettesView() {
        if (this.currentView !== 'myPalettes') {
            this.viewHistory.push(this.currentView);
            this.updateBackButton();
        }
        
        this.currentView = 'myPalettes';
        this.hideAllViews();
        const myPalettesView = document.getElementById('myPalettesView');
        if (myPalettesView) {
            myPalettesView.classList.remove('hidden');
            
            // 更新类名以修复遮挡问题，同时保持居中
            const container = myPalettesView.querySelector('.main-content-full');
            if (container) {
                container.className = 'main-content-with-padding centered-container';
            }
            
            myPalettes.renderMyPalette();
            myPalettes.renderRecommendedPalettes();
        }
    }

    // 显示文章详情视图
    showDetailView() {
        if (this.currentView !== 'detail') {
            this.viewHistory.push(this.currentView);
            this.updateBackButton();
        }
        
        this.currentView = 'detail';
        this.hideAllViews();
        document.getElementById('detailView')?.classList.remove('hidden');
    }

    // 显示编辑器视图
    showEditorView() {
        if (this.currentView !== 'editor') {
            this.viewHistory.push(this.currentView);
            this.updateBackButton();
        }
        
        this.currentView = 'editor';
        this.hideAllViews();
        const editorView = document.getElementById('editorView');
        if (editorView) {
            editorView.classList.remove('hidden');
            
            // 更新类名以修复遮挡问题，同时保持居中
            const container = editorView.querySelector('.main-content-full');
            if (container) {
                container.className = 'main-content-with-padding centered-container';
            }
        }
    }

    // 隐藏所有视图
    hideAllViews() {
        const views = ['mainView', 'previewView', 'myPalettesView', 'detailView', 'editorView'];
        views.forEach(viewId => {
            const view = document.getElementById(viewId);
            if (view) view.classList.add('hidden');
        });
    }

    // 返回上一步
    goBack() {
        if (this.viewHistory.length > 0) {
            const previousView = this.viewHistory.pop();
            this.updateBackButton();
            
            switch (previousView) {
                case 'main':
                    this.showMainView();
                    break;
                case 'preview':
                    this.showPreviewView();
                    break;
                case 'myPalettes':
                    this.showMyPalettesView();
                    break;
                case 'detail':
                    this.showDetailView();
                    break;
                case 'editor':
                    this.showEditorView();
                    break;
            }
        }
    }

    // 回到首页
    goHome() {
        if (this.currentView !== 'main') {
            this.viewHistory = [];
            this.updateBackButton();
            this.showMainView();
        }
    }

    // 更新返回按钮状态
    updateBackButton() {
        const backButton = document.getElementById('backButton');
        if (backButton) {
            if (this.viewHistory.length > 0) {
                backButton.classList.remove('opacity-0', 'invisible');
                backButton.classList.add('opacity-100', 'visible');
            } else {
                backButton.classList.add('opacity-0', 'invisible');
                backButton.classList.remove('opacity-100', 'visible');
            }
        }
    }
}

// 年份筛选函数 - 修复高亮问题
function filterByYear(year) {
    // 直接调用uiComponents的方法，不需要重复的高亮逻辑
    if (window.uiComponents && typeof uiComponents.filterByYear === 'function') {
        uiComponents.filterByYear(year);
    }
}

// 创建应用实例
const app = new AcademicColorApp();

// 全局函数（为了兼容HTML中的onclick）
function goHome() {
    if (window.navigationManager) {
        navigationManager.goHome();
    }
}

function goBack() {
    if (window.navigationManager) {
        navigationManager.goBack();
    }
}

function showPreviewTool() {
    if (window.navigationManager) {
        navigationManager.showPreviewView();
    }
}

function showMyPalettes() {
    if (window.navigationManager) {
        navigationManager.showMyPalettesView();
    }
}

function backToMain() {
    if (window.navigationManager) {
        navigationManager.showMainView();
    }
}

// 应用程序入口点
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

// 错误处理
window.addEventListener('error', (event) => {
    console.error('全局错误:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('未处理的Promise拒绝:', event.reason);
});

// 导出主要对象到全局作用域
window.app = app;
window.dataManager = dataManager;
window.uiComponents = uiComponents;
window.previewTool = previewTool;
window.myPalettes = myPalettes;
window.articleDetail = articleDetail;
window.articleEditor = articleEditor;
window.ColorUtils = ColorUtils;
