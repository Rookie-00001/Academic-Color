// UI组件管理模块
class UIComponents {
    constructor() {
        this.currentFilters = {
            field: 'all',
            subfield: null, // 新增子领域筛选
            journal: 'all',
            year: 'all',
            colorCount: 'all',
            search: ''
        };
        this.contextMenuData = null;
        this.yearRange = null; // 添加年份范围支持
    }

    // 初始化UI组件
    init() {
        this.setupEventListeners();
        this.setupMobileMenu();
        this.setupContextMenu();
        this.initTheme();
        this.renderYearFiltersAdvanced(); // 添加增强年份筛选渲染
    }

    // 设置事件监听器
    setupEventListeners() {
        // 搜索功能
        const searchHandler = (e) => {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.currentFilters.search = e.target.value.toLowerCase();
                this.renderArticles();
            }, 300);
        };
        
        document.getElementById('searchInput')?.addEventListener('input', searchHandler);
        document.getElementById('searchInputMobile')?.addEventListener('input', searchHandler);

        // 主题切换
        document.getElementById('themeToggle')?.addEventListener('click', () => this.toggleTheme());

        // 窗口大小变化
        window.addEventListener('resize', () => this.handleResize());
    }

    // 移动端菜单设置
    setupMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar && overlay) {
            sidebar.classList.remove('mobile-open');
            overlay.classList.add('hidden');
        }
    }

    // 切换移动端菜单
    toggleMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar && overlay) {
            if (sidebar.classList.contains('mobile-open')) {
                sidebar.classList.remove('mobile-open');
                overlay.classList.add('hidden');
            } else {
                sidebar.classList.add('mobile-open');
                overlay.classList.remove('hidden');
            }
        }
    }

    // 配色右键菜单设置
    setupContextMenu() {
        const contextMenu = document.getElementById('colorContextMenu');
        if (!contextMenu) return;
        
        // 更新主题
        const updateContextMenuTheme = () => {
            const theme = document.body.getAttribute('data-theme');
            if (theme === 'dark') {
                contextMenu.classList.add('dark');
            } else {
                contextMenu.classList.remove('dark');
            }
        };
        
        updateContextMenuTheme();
        
        // 监听主题变化
        const observer = new MutationObserver(updateContextMenuTheme);
        observer.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });
        
        // 点击其他地方关闭菜单
        document.addEventListener('click', () => {
            contextMenu.style.display = 'none';
        });
    }

    // 显示颜色右键菜单
    showColorContextMenu(event, color, rgb, name) {
        event.preventDefault();
        event.stopPropagation();
        
        const contextMenu = document.getElementById('colorContextMenu');
        if (!contextMenu) return;
        
        this.contextMenuData = { color, rgb, name };
        
        contextMenu.style.display = 'block';
        contextMenu.style.left = event.pageX + 'px';
        contextMenu.style.top = event.pageY + 'px';
        
        // 确保菜单在屏幕内
        const rect = contextMenu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            contextMenu.style.left = (event.pageX - rect.width) + 'px';
        }
        if (rect.bottom > window.innerHeight) {
            contextMenu.style.top = (event.pageY - rect.height) + 'px';
        }
    }

    // 复制颜色值（HEX）
    copyColorHex() {
        if (this.contextMenuData) {
            this.copyToClipboard(this.contextMenuData.color, `${this.contextMenuData.name} HEX`);
        }
        this.hideContextMenu();
    }

    // 复制颜色值（RGB）
    copyColorRgb() {
        if (this.contextMenuData) {
            this.copyToClipboard(this.contextMenuData.rgb, `${this.contextMenuData.name} RGB`);
        }
        this.hideContextMenu();
    }

    // 复制颜色名称
    copyColorName() {
        if (this.contextMenuData) {
            this.copyToClipboard(this.contextMenuData.name, '颜色名称');
        }
        this.hideContextMenu();
    }

    // 隐藏右键菜单
    hideContextMenu() {
        const contextMenu = document.getElementById('colorContextMenu');
        if (contextMenu) {
            contextMenu.style.display = 'none';
        }
    }

    // 主题相关函数
    initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateThemeIcon(newTheme);
    }

    updateThemeIcon(theme) {
        const sunIcon = document.getElementById('sunIcon');
        const moonIcon = document.getElementById('moonIcon');
        
        if (sunIcon && moonIcon) {
            if (theme === 'dark') {
                sunIcon.classList.add('hidden');
                moonIcon.classList.remove('hidden');
            } else {
                sunIcon.classList.remove('hidden');
                moonIcon.classList.add('hidden');
            }
        }
    }

    // 增强版年份筛选渲染
    renderYearFiltersAdvanced() {
        const yearsSection = document.querySelector('#yearsSection .grid');
        if (!yearsSection) return;

        // 获取所有文章的年份和数量
        const articles = dataManager.getArticles();
        const yearCounts = {};
        
        articles.forEach(article => {
            const year = parseInt(article.year);
            if (!isNaN(year)) {
                yearCounts[year] = (yearCounts[year] || 0) + 1;
            }
        });

        const years = Object.keys(yearCounts).map(year => parseInt(year)).sort((a, b) => b - a);
        const totalArticles = articles.length;

        if (years.length === 0) {
            yearsSection.innerHTML = '<p class="text-theme-secondary text-sm">暂无数据</p>';
            return;
        }

        // 生成年份按钮HTML
        let yearButtonsHTML = `
            <button onclick="filterByYear('all')" class="year-filter px-3 py-2 text-sm rounded-lg transition-all bg-blue-500 text-white" data-year="all">
                全部 <span class="text-xs opacity-90">(${totalArticles})</span>
            </button>
        `;

        // 如果年份超过6个，显示年份范围按钮
        if (years.length > 6) {
            const recentYears = years.slice(0, 3);
            const olderYears = years.slice(3);
            
            // 最近年份 - 移除数字显示
            recentYears.forEach(year => {
                yearButtonsHTML += `
                    <button onclick="filterByYear(${year})" class="year-filter px-3 py-2 text-sm rounded-lg transition-all bg-theme-tertiary text-theme-primary hover:bg-theme-secondary" data-year="${year}">
                        ${year}
                    </button>
                `;
            });

            // 较早年份合并显示 - 移除数字显示
            const oldestYear = Math.min(...olderYears);
            const newestOldYear = Math.max(...olderYears);
            
            yearButtonsHTML += `
                <button onclick="filterByYearRange(${oldestYear}, ${newestOldYear})" class="year-filter px-3 py-2 text-sm rounded-lg transition-all bg-theme-tertiary text-theme-primary hover:bg-theme-secondary" data-year="range-${oldestYear}-${newestOldYear}">
                    ${oldestYear}-${newestOldYear}
                </button>
            `;
        } else {
            // 年份较少时，显示所有年份 - 移除数字显示
            years.forEach(year => {
                yearButtonsHTML += `
                    <button onclick="filterByYear(${year})" class="year-filter px-3 py-2 text-sm rounded-lg transition-all bg-theme-tertiary text-theme-primary hover:bg-theme-secondary" data-year="${year}">
                        ${year}
                    </button>
                `;
            });
        }

        yearsSection.innerHTML = yearButtonsHTML;
    }

    // 修改：渲染研究领域列表（支持分层结构）
    renderFieldsList() {
        const container = document.getElementById('fieldsList');
        if (!container) return;

        const fields = dataManager.getFields();
        const journals = dataManager.getJournals();
        const articles = dataManager.getArticles();

        // 计算每个领域和子领域的文章数量
        const fieldCounts = {};
        const subfieldCounts = {};
        
        articles.forEach(article => {
            // 主领域计数
            fieldCounts[article.field] = (fieldCounts[article.field] || 0) + 1;
            
            // 子领域计数
            if (article.subfield) {
                const subfieldKey = `${article.field}.${article.subfield}`;
                subfieldCounts[subfieldKey] = (subfieldCounts[subfieldKey] || 0) + 1;
            }
        });

        let fieldsHTML = `
            <button onclick="uiComponents.selectField('all')" class="field-filter w-full text-left px-3 py-2 rounded-lg transition-all bg-blue-50 text-blue-700 border border-blue-200" data-field="all">
                <div class="flex items-center justify-between">
                    <span class="text-sm flex items-center">
                        <span class="mr-2">📚</span>
                        全部领域
                    </span>
                    <span class="text-xs bg-blue-100 px-2 py-1 rounded-full">${articles.length}</span>
                </div>
            </button>
        `;

        // 渲染主要研究领域
        Object.entries(fields).forEach(([key, field]) => {
            if (key === 'all') return;

            const count = fieldCounts[key] || 0;
            const hasSubcategories = field.subcategories;

            fieldsHTML += `
                <button onclick="uiComponents.selectField('${key}')" class="field-filter w-full text-left px-3 py-2 rounded-lg transition-all hover:bg-theme-tertiary text-theme-primary" data-field="${key}">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center">
                            <span class="mr-2">${field.icon}</span>
                            <span class="text-sm">${field.name}</span>
                        </div>
                        <div class="flex items-center space-x-2">
                            <span class="text-xs bg-theme-tertiary px-2 py-1 rounded-full">${count}</span>
                            ${hasSubcategories ? `
                                <svg id="${key}Chevron" class="w-3 h-3 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                                </svg>
                            ` : ''}
                        </div>
                    </div>
                </button>
            `;

            // 渲染子领域
            if (hasSubcategories) {
                fieldsHTML += `<div id="${key}Subcategories" class="collapsible ml-4 space-y-1">`;
                
                Object.entries(field.subcategories).forEach(([subKey, subField]) => {
                    const subfieldCount = subfieldCounts[`${key}.${subKey}`] || 0;
                    
                    fieldsHTML += `
                        <button onclick="uiComponents.selectSubfield('${key}', '${subKey}')" class="subfield-filter w-full text-left px-3 py-2 rounded-lg transition-all hover:bg-theme-tertiary text-theme-secondary text-sm" data-field="${key}" data-subfield="${subKey}">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center">
                                    <span class="mr-2">${subField.icon}</span>
                                    <span>${subField.name}</span>
                                </div>
                                <div class="flex items-center space-x-2">
                                    <span class="text-xs bg-theme-tertiary px-2 py-1 rounded-full">${subfieldCount}</span>
                                    <svg id="${key}_${subKey}Chevron" class="w-3 h-3 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                                    </svg>
                                </div>
                            </div>
                        </button>
                    `;

                    // 渲染该子领域的期刊
                    const subfieldJournals = Object.entries(journals).filter(([jKey, journal]) => 
                        journal.field === key && journal.subfield === subKey
                    );

                    if (subfieldJournals.length > 0) {
                        fieldsHTML += `<div id="${key}_${subKey}Journals" class="collapsible ml-6 space-y-1">`;
                        subfieldJournals.forEach(([jKey, journal]) => {
                            fieldsHTML += `
                                <button onclick="uiComponents.filterByJournal('${jKey}')" class="journal-filter w-full text-left px-2 py-1 rounded-lg transition-all hover:bg-theme-tertiary text-theme-secondary text-xs" data-journal="${jKey}">
                                    <div class="flex items-center">
                                        <div class="w-2 h-2 rounded-full mr-2" style="background-color: ${journal.color};"></div>
                                        <span>${journal.name}</span>
                                    </div>
                                </button>
                            `;
                        });
                        fieldsHTML += `</div>`;
                    }
                });
                
                fieldsHTML += `</div>`;
            }
        });

        container.innerHTML = fieldsHTML;
    }

    // 折叠功能
    toggleSection(sectionName) {
        const section = document.getElementById(sectionName + 'Section');
        const chevron = document.getElementById(sectionName + 'Chevron');
        
        if (section && chevron) {
            if (section.classList.contains('expanded')) {
                section.classList.remove('expanded');
                chevron.style.transform = 'rotate(180deg)';
            } else {
                section.classList.add('expanded');
                chevron.style.transform = 'rotate(0deg)';
            }
        }
    }

    // 修改：选择领域
    selectField(field) {
        this.currentFilters.field = field;
        this.currentFilters.subfield = null; // 重置子领域
        this.currentFilters.journal = 'all';
        
        this.updateFilterButtons('field-filter', field);
        this.toggleSubcategories(field);
        this.renderArticles();
    }

    // 新增：选择子领域
    selectSubfield(field, subfield) {
        this.currentFilters.field = field;
        this.currentFilters.subfield = subfield;
        this.currentFilters.journal = 'all';
        
        this.updateFilterButtons('subfield-filter', `${field}.${subfield}`);
        this.toggleSubcategories(field, subfield);
        this.renderArticles();
    }

    // 修改：展开子分类
    toggleSubcategories(field, activeSubfield = null) {
        const fields = dataManager.getFields();
        
        // 隐藏所有子分类
        Object.keys(fields).forEach(f => {
            if (f !== 'all') {
                const element = document.getElementById(f + 'Subcategories');
                if (element) element.classList.remove('expanded');
                const chevron = document.getElementById(f + 'Chevron');
                if (chevron) chevron.style.transform = 'rotate(0deg)';
                
                // 隐藏所有期刊列表
                if (fields[f].subcategories) {
                    Object.keys(fields[f].subcategories).forEach(subf => {
                        const journalsElement = document.getElementById(`${f}_${subf}Journals`);
                        if (journalsElement) journalsElement.classList.remove('expanded');
                        const subChevron = document.getElementById(`${f}_${subf}Chevron`);
                        if (subChevron) subChevron.style.transform = 'rotate(0deg)';
                    });
                }
            }
        });

        // 显示选中领域的子分类
        if (field !== 'all') {
            const subcategoriesId = field + 'Subcategories';
            const element = document.getElementById(subcategoriesId);
            if (element) element.classList.add('expanded');
            
            const chevron = document.getElementById(field + 'Chevron');
            if (chevron) chevron.style.transform = 'rotate(90deg)';

            // 如果有活跃的子领域，也展开其期刊列表
            if (activeSubfield) {
                const journalsElement = document.getElementById(`${field}_${activeSubfield}Journals`);
                if (journalsElement) journalsElement.classList.add('expanded');
                const subChevron = document.getElementById(`${field}_${activeSubfield}Chevron`);
                if (subChevron) subChevron.style.transform = 'rotate(90deg)';
            }
        }
    }

    filterByJournal(journal) {
        this.currentFilters.journal = journal;
        this.updateFilterButtons('journal-filter', journal);
        this.renderArticles();
    }

    filterByYear(year) {
        this.currentFilters.year = year;
        this.yearRange = null; // 清除年份范围
        
        // 手动更新年份按钮高亮状态
        document.querySelectorAll('.year-filter').forEach(btn => {
            btn.classList.remove('bg-blue-500', 'text-white');
            btn.classList.add('bg-theme-tertiary', 'text-theme-primary', 'hover:bg-theme-secondary');
        });
        
        // 高亮当前选中的年份按钮
        const activeBtn = document.querySelector(`[data-year="${year}"]`);
        if (activeBtn) {
            activeBtn.classList.remove('bg-theme-tertiary', 'text-theme-primary', 'hover:bg-theme-secondary');
            activeBtn.classList.add('bg-blue-500', 'text-white');
        }
        
        this.renderArticles();
    }

    // 年份范围筛选
    filterByYearRange(startYear, endYear) {
        this.currentFilters.year = 'range';
        this.yearRange = { start: startYear, end: endYear };
        this.updateYearRangeButtons(startYear, endYear);
        this.renderArticles();
    }

    // 更新年份范围按钮状态
    updateYearRangeButtons(startYear, endYear) {
        document.querySelectorAll('.year-filter').forEach(btn => {
            btn.className = 'year-filter px-3 py-2 text-sm rounded-lg transition-all bg-theme-tertiary text-theme-primary hover:bg-theme-secondary';
        });

        // 高亮范围按钮
        const rangeButton = document.querySelector(`[data-year="range-${startYear}-${endYear}"]`);
        if (rangeButton) {
            rangeButton.className = 'year-filter px-3 py-2 text-sm rounded-lg transition-all bg-blue-500 text-white';
        }
    }

    filterByColorCount(count) {
        this.currentFilters.colorCount = count;
        this.updateFilterButtons('color-count-filter', count);
        this.renderArticles();
    }

    // 修改：更新筛选按钮状态
    updateFilterButtons(className, activeValue) {
        const buttons = document.querySelectorAll(`.${className}`);
        buttons.forEach(btn => {
            const value = btn.dataset.field || 
                          (btn.dataset.field && btn.dataset.subfield ? `${btn.dataset.field}.${btn.dataset.subfield}` : '') ||
                          btn.dataset.journal || 
                          btn.dataset.year || 
                          btn.dataset.count;
                          
            if (value === activeValue) {
                if (className === 'field-filter' || className === 'journal-filter' || className === 'subfield-filter') {
                    btn.className = `${className} w-full text-left px-3 py-2 rounded-lg transition-all bg-blue-50 text-blue-700 border border-blue-200`;
                } else if (className === 'color-count-filter') {
                    btn.className = `${className} w-full text-left px-3 py-2 rounded-lg transition-all bg-purple-50 text-purple-700 border border-purple-200`;
                } else {
                    btn.className = `${className} px-3 py-2 text-sm rounded-lg transition-all bg-blue-500 text-white`;
                }
            } else {
                if (className === 'field-filter' || className === 'journal-filter') {
                    btn.className = `${className} w-full text-left px-3 py-2 rounded-lg transition-all hover:bg-theme-tertiary text-theme-primary`;
                } else if (className === 'subfield-filter') {
                    btn.className = `${className} w-full text-left px-3 py-2 rounded-lg transition-all hover:bg-theme-tertiary text-theme-secondary text-sm`;
                } else if (className === 'color-count-filter') {
                    btn.className = `${className} w-full text-left px-3 py-2 rounded-lg transition-all hover:bg-theme-tertiary text-theme-primary`;
                } else {
                    btn.className = `${className} px-3 py-2 text-sm rounded-lg transition-all bg-theme-tertiary text-theme-primary hover:bg-theme-secondary`;
                }
            }
        });
    }

    // 渲染文章列表
    renderArticles() {
        const articles = this.getFilteredArticles();
        const container = document.getElementById('articlesContainer');
        const noResults = document.getElementById('noResults');
        const resultCount = document.getElementById('resultCount');

        if (!container || !noResults || !resultCount) return;

        resultCount.textContent = `找到 ${articles.length} 篇文章`;

        if (articles.length === 0) {
            container.innerHTML = '';
            noResults.classList.remove('hidden');
            return;
        }

        noResults.classList.add('hidden');
        container.className = 'grid grid-cols-1 xl:grid-cols-2 gap-6';

        const journals = dataManager.getJournals();

        container.innerHTML = articles.map((item, index) => {
            const journal = journals[item.journal];
            const fieldInfo = this.getFieldDisplayInfo(item.field, item.subfield);
            const firstFigure = item.figures[0];
            const gradientColors = firstFigure.colors.map(c => c.hex).join(', ');

            return `
                <div class="article-card bg-theme-primary rounded-2xl shadow-lg overflow-hidden group border border-theme slide-in" style="animation-delay: ${index * 0.1}s;">
                    <div class="relative overflow-hidden">
                        <div class="h-3" style="background: linear-gradient(90deg, ${gradientColors});"></div>
                        <div class="p-6 bg-theme-secondary">
                            <div class="flex items-start justify-between mb-4">
                                <div class="flex items-center space-x-3">
                                    <div class="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm" style="background-color: ${journal?.color || '#666'};">
                                        ${journal?.name.substring(0, 2).toUpperCase() || 'N/A'}
                                    </div>
                                    <div>
                                        <h3 class="font-bold text-theme-primary">${journal?.name || 'Unknown Journal'}</h3>
                                        <div class="flex items-center space-x-2 text-sm text-theme-secondary">
                                            <span>${fieldInfo.icon || '📄'}</span>
                                            <span>${item.year}</span>
                                            <span>•</span>
                                            <span>${fieldInfo.name || '未知领域'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <h4 class="font-semibold text-theme-primary mb-2 line-clamp-2">${item.title}</h4>
                            <p class="text-sm text-theme-secondary mb-3">${item.authors}</p>
                            
                            <div class="flex flex-wrap gap-1 mb-4">
                                ${item.tags.slice(0, 3).map(tag => `<span class="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">#${tag}</span>`).join('')}
                                ${item.tags.length > 3 ? `<span class="text-xs text-theme-tertiary">+${item.tags.length - 3}</span>` : ''}
                            </div>

                            <div class="flex items-center justify-between">
                                <div class="flex items-center space-x-2 text-sm text-theme-secondary">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                        <polyline points="21,15 16,10 5,21"></polyline>
                                    </svg>
                                    <span>${item.figures.length} 个图表配色</span>
                                    <span>•</span>
                                    <span>${item.figures.reduce((total, fig) => total + fig.colors.length, 0)} 种颜色</span>
                                </div>
                                <button onclick="uiComponents.showArticleDetail(${item.id})" class="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                    </svg>
                                    <span>查看详情</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="p-6">
                        <div class="color-strip flex rounded-xl overflow-hidden shadow-lg mb-4 h-12">
                            ${firstFigure.colors.map((color, colorIndex) => `
                                <div 
                                    class="flex-1 cursor-pointer transition-all duration-300 relative group"
                                    style="background-color: ${color.hex};"
                                    onclick="uiComponents.copyColorWithFeedback(this, '${color.hex}', '${color.name}')"
                                >
                                    <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-30">
                                        <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
                                        </svg>
                                    </div>
                                    <div class="copy-feedback">已复制!</div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="flex items-center justify-between">
                            <div class="text-center flex-1">
                                <p class="text-sm font-medium text-theme-primary">${firstFigure.name}</p>
                                <p class="text-xs text-theme-secondary mt-1"></p>
                            </div>
                            <button onclick="uiComponents.copyAllFigureColors([${firstFigure.colors.map(c => `'${c.hex}'`).join(',')}])" class="ml-4 px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all text-xs">
                                复制全部
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 新增：获取领域显示信息的辅助方法
    getFieldDisplayInfo(fieldKey, subfieldKey) {
        const fields = dataManager.getFields();
        const field = fields[fieldKey];
        
        if (!field) {
            return { name: '未知领域', icon: '📄' };
        }
        
        if (subfieldKey && field.subcategories && field.subcategories[subfieldKey]) {
            const subfield = field.subcategories[subfieldKey];
            return {
                name: subfield.name,
                icon: subfield.icon
            };
        }
        
        return {
            name: field.name,
            icon: field.icon
        };
    }

    // 修改：获取筛选后的文章（支持子领域筛选）
    getFilteredArticles() {
        let articles = dataManager.getArticles();

        // 搜索筛选
        if (this.currentFilters.search) {
            articles = articles.filter(article =>
                article.title.toLowerCase().includes(this.currentFilters.search) ||
                article.authors.toLowerCase().includes(this.currentFilters.search) ||
                article.tags.some(tag => tag.toLowerCase().includes(this.currentFilters.search))
            );
        }

        // 领域筛选
        if (this.currentFilters.field !== 'all') {
            articles = articles.filter(article => article.field === this.currentFilters.field);
            
            // 子领域筛选
            if (this.currentFilters.subfield) {
                articles = articles.filter(article => article.subfield === this.currentFilters.subfield);
            }
        }

        // 期刊筛选
        if (this.currentFilters.journal !== 'all') {
            articles = articles.filter(article => article.journal === this.currentFilters.journal);
        }

        // 年份筛选（支持范围）
        if (this.currentFilters.year === 'range' && this.yearRange) {
            articles = articles.filter(article => {
                const articleYear = parseInt(article.year);
                return articleYear >= this.yearRange.start && articleYear <= this.yearRange.end;
            });
        } else if (this.currentFilters.year !== 'all') {
            articles = articles.filter(article => {
                const articleYear = parseInt(article.year);
                const filterYear = parseInt(this.currentFilters.year);
                return articleYear === filterYear;
            });
        }

        // 配色数量筛选
        if (this.currentFilters.colorCount !== 'all') {
            articles = articles.filter(article => {
                const totalColors = article.figures.reduce((sum, figure) => sum + figure.colors.length, 0);
                
                switch (this.currentFilters.colorCount) {
                    case '3':
                        return totalColors === 3;
                    case '4':
                        return totalColors === 4;
                    case '5':
                        return totalColors === 5;
                    case '6+':
                        return totalColors >= 6;
                    default:
                        return true;
                }
            });
        }

        return articles;
    }

    // 显示文章详情
    showArticleDetail(articleId) {
        if (window.articleDetail) {
            window.articleDetail.show(articleId);
        }
    }

    // 颜色复制相关方法
    copyColorWithFeedback(element, color, name) {
        this.copyToClipboard(color, name);
        
        // 显示复制反馈
        element.classList.add('show-copy-feedback');
        setTimeout(() => {
            element.classList.remove('show-copy-feedback');
        }, 1000);
    }

    copyAllFigureColors(colors) {
        const colorString = colors.join(', ');
        this.copyToClipboard(colorString, '图表配色');
    }

    // 复制到剪贴板
    async copyToClipboard(text, description) {
        try {
            await navigator.clipboard.writeText(text);
            this.showCopyToast(`${description} 已复制: ${text}`);
        } catch (err) {
            console.error('复制失败:', err);
            // 降级方案
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showCopyToast(`${description} 已复制: ${text}`);
        }
    }

    // 显示复制提示
    showCopyToast(message) {
        const toast = document.getElementById('copyToast');
        const toastText = document.getElementById('copyToastText');
        
        if (toast && toastText) {
            toastText.textContent = message;
            toast.style.transform = 'translateX(0)';
            setTimeout(() => {
                toast.style.transform = 'translateX(100%)';
            }, 3000);
        }
    }

    // 窗口大小变化处理
    handleResize() {
        // 在移动设备上自动关闭侧边栏
        if (window.innerWidth >= 768) {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('sidebarOverlay');
            if (sidebar && overlay) {
                sidebar.classList.remove('mobile-open');
                overlay.classList.add('hidden');
            }
        }
    }

    // 获取当前筛选器状态
    getCurrentFilters() {
        return { ...this.currentFilters, yearRange: this.yearRange };
    }

    // 重置筛选器
    resetFilters() {
        this.currentFilters = {
            field: 'all',
            subfield: null,
            journal: 'all',
            year: 'all',
            colorCount: 'all',
            search: ''
        };
        this.yearRange = null;
        
        // 重置UI状态
        this.updateFilterButtons('field-filter', 'all');
        this.updateFilterButtons('year-filter', 'all');
        this.updateFilterButtons('color-count-filter', 'all');
        
        // 清空搜索框
        const searchInputs = ['searchInput', 'searchInputMobile'];
        searchInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) input.value = '';
        });
        
        this.renderArticles();
    }

    // 更新统计信息
    updateStatistics() {
        const stats = dataManager.getStatistics();
        const resultCount = document.getElementById('resultCount');
        if (resultCount) {
            resultCount.textContent = `找到 ${stats.totalArticles} 篇文章`;
        }
    }
}

// 创建全局UI组件实例
const uiComponents = new UIComponents();

// 全局函数（为了兼容HTML中的onclick）
function toggleMobileMenu() {
    uiComponents.toggleMobileMenu();
}

function toggleSection(sectionName) {
    uiComponents.toggleSection(sectionName);
}

function filterByYear(year) {
    uiComponents.filterByYear(year);
}

// 年份范围筛选全局函数
function filterByYearRange(startYear, endYear) {
    uiComponents.filterByYearRange(startYear, endYear);
}

function filterByColorCount(count) {
    uiComponents.filterByColorCount(count);
}

function copyColorHex() {
    uiComponents.copyColorHex();
}

function copyColorRgb() {
    uiComponents.copyColorRgb();
}

function copyColorName() {
    uiComponents.copyColorName();
}
