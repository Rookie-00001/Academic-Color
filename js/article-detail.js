// 文章详情功能模块
class ArticleDetail {
    constructor() {
        this.currentArticle = null;
    }

    // 显示文章详情
    show(articleId) {
        this.currentArticle = dataManager.getArticleById(articleId);
        if (!this.currentArticle) {
            console.error('文章不存在:', articleId);
            return;
        }

        // 切换到详情视图
        if (window.navigationManager) {
            navigationManager.showDetailView();
        }

        this.render();
    }

    // 渲染文章详情
    render() {
        if (!this.currentArticle) return;

        const journals = dataManager.getJournals();
        const fields = dataManager.getFields();
        const journal = journals[this.currentArticle.journal];
        const field = fields[this.currentArticle.field];

        this.updateBreadcrumb(field, journal);
        this.updateArticleInfo(journal, field);
        this.updateFigures();
        this.updateColorTable();
    }

    // 更新面包屑导航
    updateBreadcrumb(field, journal) {
        const breadcrumbField = document.getElementById('breadcrumbField');
        const breadcrumbJournal = document.getElementById('breadcrumbJournal');
        const breadcrumbTitle = document.getElementById('breadcrumbTitle');

        if (breadcrumbField) breadcrumbField.textContent = field?.name || '未知领域';
        if (breadcrumbJournal) breadcrumbJournal.textContent = journal?.name || '未知期刊';
        if (breadcrumbTitle) {
            const title = this.currentArticle.title;
            breadcrumbTitle.textContent = title.length > 50 ? title.substring(0, 50) + '...' : title;
        }
    }

    // 更新文章信息卡片
    updateArticleInfo(journal, field) {
        const container = document.getElementById('articleInfoCard');
        if (!container) return;

        container.innerHTML = `
            <div class="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
                <div class="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0" 
                     style="background-color: ${journal?.color || '#666'};">
                    ${journal?.name.substring(0, 2).toUpperCase() || 'N/A'}
                </div>
                <div class="flex-1">
                    <h2 class="text-xl md:text-2xl font-bold gradient-text mb-2">${this.currentArticle.title}</h2>
                    <p class="text-base md:text-lg text-theme-secondary mb-2">${this.currentArticle.authors}</p>
                    <div class="flex flex-wrap items-center gap-2 text-sm text-theme-secondary mb-4">
                        <span class="font-medium">${journal?.name || '未知期刊'}</span>
                        <span>•</span>
                        <span>${this.currentArticle.year}</span>
                        <span>•</span>
                        <span>${field?.name || '未知领域'}</span>
                        <span>•</span>
                        <span class="font-mono text-xs bg-theme-tertiary px-2 py-1 rounded">${this.currentArticle.doi}</span>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        ${this.currentArticle.tags.map(tag => `
                            <span class="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full">#${tag}</span>
                        `).join('')}
                    </div>
                </div>
                <div class="flex flex-row md:flex-col items-center md:items-end space-x-3 md:space-x-0 md:space-y-3">
                    <div class="text-center bg-theme-tertiary p-3 rounded-xl">
                        <div class="text-lg font-bold text-blue-600">${this.currentArticle.figures.length}</div>
                        <div class="text-xs text-theme-secondary">图表配色</div>
                    </div>
                    <div class="text-center bg-theme-tertiary p-3 rounded-xl">
                        <div class="text-lg font-bold text-green-600">${this.currentArticle.figures.reduce((total, fig) => total + fig.colors.length, 0)}</div>
                        <div class="text-xs text-theme-secondary">总颜色数</div>
                    </div>
                </div>
            </div>
        `;
    }

    // 更新图表配色展示
    updateFigures() {
        const container = document.getElementById('figuresGrid');
        if (!container) return;

        // 动态调整网格布局
        if (this.currentArticle.figures.length === 1) {
            container.className = 'figures-grid-single mb-8';
        } else {
            container.className = 'figures-grid-multiple mb-8';
        }

        container.innerHTML = this.currentArticle.figures.map((figure, index) => `
            <div class="bg-theme-primary rounded-2xl shadow-lg overflow-hidden transition-all duration-300 border border-theme slide-in ${this.currentArticle.figures.length === 1 ? 'single-figure-card' : ''}" 
                 style="animation-delay: ${index * 0.1}s;">
                
                <!-- 图表图像展示区域 -->
                <div class="relative bg-gray-100">
                    <div class="relative overflow-hidden group">
                        <!-- 实际图片 -->
                        <img src="${figure.image_path}" 
                             alt="${figure.name}"
                             class="w-full h-auto object-contain max-h-96 cursor-pointer transition-transform duration-300"
                             onclick="articleDetail.showImageModal('${figure.image_path}', '${figure.name}')"
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        
                        <!-- 图片加载失败时的占位符 -->
                        <div class="w-full h-48 bg-gradient-to-br flex items-center justify-center text-white" 
                             style="background: linear-gradient(135deg, ${figure.colors[0].hex}, ${figure.colors[figure.colors.length-1].hex}); display: none;">
                            <div class="text-center">
                                ${this.getFigureTypeIcon(figure.figure_type)}
                                <p class="text-sm opacity-75 mt-2">${this.getFigureTypeName(figure.figure_type)}</p>
                                <p class="text-xs opacity-60 mt-1">图片加载失败</p>
                            </div>
                        </div>
                        
                        <!-- 放大按钮 -->
                        <button onclick="articleDetail.showImageModal('${figure.image_path}', '${figure.name}')"
                                class="absolute bottom-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all opacity-0 group-hover:opacity-100">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z M15 15l6 6"></path>
                            </svg>
                        </button>
                        
                        <!-- 颜色数量标签 -->
                        <div class="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                            ${figure.colors.length} 种颜色
                        </div>
                    </div>
                </div>
                
                <div class="p-4 md:p-6">
                    <!-- 图表标题和操作 -->
                    <div class="flex items-start justify-between mb-3">
                        <div class="flex-1">
                            <h3 class="font-bold text-theme-primary text-sm md:text-base mb-1">${figure.name}</h3>
                            <p class="text-xs text-theme-secondary">${figure.description}</p>
                        </div>
                        <div class="flex space-x-2 ml-4">
                            <button onclick="articleDetail.copyFigureColors(${index})" 
                                    class="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                                    title="复制所有颜色">
                                复制全部
                            </button>
                            <button onclick="articleDetail.exportFigureColors(${index})" 
                                    class="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                                    title="导出配色">
                                导出
                            </button>
                        </div>
                    </div>

                    <!-- 配色条 -->
                    <div class="flex rounded-xl overflow-hidden shadow-lg mb-4 h-12 md:h-16">
                        ${figure.colors.map((color, colorIndex) => `
                            <div class="flex-1 cursor-pointer transition-all duration-300 relative group"
                                 style="background-color: ${color.hex};"
                                 onclick="articleDetail.copyColorWithFeedback(this, '${color.hex}', '${color.name}')"
                                 oncontextmenu="uiComponents.showColorContextMenu(event, '${color.hex}', '${color.rgb}', '${color.name}'); return false;">
                                
                                <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black bg-opacity-30">
                                    <svg class="w-3 md:w-4 h-3 md:h-4 text-white transform group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
                                    </svg>
                                </div>
                                <div class="copy-feedback">已复制!</div>
                                
                                <!-- 颜色信息提示 -->
                                <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 transform translate-y-full opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    <div class="font-mono">${color.hex}</div>
                                    <div class="truncate">${color.name}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <!-- 颜色详细信息 -->
                    <div class="space-y-2">
                        ${figure.colors.map((color, colorIndex) => `
                            <div class="flex items-center justify-between p-3 bg-theme-secondary rounded-lg transition-all duration-300 hover:shadow-md">
                                <div class="flex items-center space-x-3 flex-1">
                                    <div class="w-6 h-6 md:w-8 md:h-8 rounded-lg shadow-sm border border-theme cursor-pointer flex-shrink-0" 
                                         style="background-color: ${color.hex};"
                                         onclick="articleDetail.copyColorWithFeedback(this, '${color.hex}', '${color.name}')">
                                    </div>
                                    <div class="min-w-0 flex-1">
                                        <p class="font-medium text-theme-primary text-sm truncate">${color.name}</p>
                                        <p class="text-xs text-theme-secondary">${color.usage}</p>
                                    </div>
                                </div>
                                
                                <div class="flex items-center space-x-2 flex-shrink-0">
                                    <button onclick="articleDetail.copyColor('${color.hex}', '${color.name} HEX')" 
                                            class="px-2 py-1 text-xs font-mono rounded-lg transition-all bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                                            title="复制HEX值">
                                        ${color.hex}
                                    </button>
                                    <button onclick="articleDetail.copyColor('${color.rgb}', '${color.name} RGB')" 
                                            class="px-2 py-1 text-xs font-mono rounded-lg transition-all bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200"
                                            title="复制RGB值">
                                        RGB
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `).join('');
    }

    // 显示图片模态框（修复版本）
    showImageModal(imagePath, title) {
        // 保存当前的滚动位置和overflow状态
        const originalOverflow = document.body.style.overflow;
        const originalPosition = window.pageYOffset;
        
        // 创建模态框
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4';
        modal.id = 'imageModal';
        
        // 关闭模态框的函数
        const closeModal = () => {
            // 恢复页面滚动
            document.body.style.overflow = originalOverflow;
            
            // 移除模态框
            if (modal && modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
            
            // 恢复滚动位置
            window.scrollTo(0, originalPosition);
        };
        
        // 点击背景关闭
        modal.onclick = (e) => {
            if (e.target === modal) {
                closeModal();
            }
        };
        
        // ESC键关闭
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);

        modal.innerHTML = `
            <div class="relative max-w-full max-h-full flex flex-col">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-white text-lg font-medium">${title}</h3>
                    <button onclick="articleDetail.closeImageModal()" 
                            class="text-white hover:text-gray-300 transition-colors">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                <div class="flex-1 flex items-center justify-center">
                    <img src="${imagePath}" 
                         alt="${title}" 
                         class="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                         style="max-height: calc(100vh - 120px);">
                </div>
            </div>
        `;

        // 添加到页面
        document.body.appendChild(modal);
        
        // 阻止背景滚动
        document.body.style.overflow = 'hidden';
        
        // 存储关闭函数供按钮调用
        this.currentModalCloseHandler = closeModal;
    }
    
    // 关闭图片模态框
    closeImageModal() {
        if (this.currentModalCloseHandler) {
            this.currentModalCloseHandler();
            this.currentModalCloseHandler = null;
        }
    }

    // 获取图表类型图标
    getFigureTypeIcon(type) {
        const icons = {
            scatter_plot: '<svg class="w-16 h-16 mx-auto opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>',
            line_plot: '<svg class="w-16 h-16 mx-auto opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="3,17 9,11 13,15 21,7"></polyline></svg>',
            bar_chart: '<svg class="w-16 h-16 mx-auto opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="7" y="8" width="3" height="8"></rect><rect x="14" y="12" width="3" height="4"></rect></svg>',
            heatmap: '<svg class="w-16 h-16 mx-auto opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="3" height="3"></rect><rect x="10" y="6" width="3" height="3"></rect><rect x="14" y="6" width="3" height="3"></rect></svg>',
            survival_curve: '<svg class="w-16 h-16 mx-auto opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 17l6-6 4 4 8-8"></path></svg>',
            default: '<svg class="w-16 h-16 mx-auto opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>'
        };
        
        return icons[type] || icons.default;
    }

    // 获取图表类型名称
    getFigureTypeName(type) {
        const names = {
            scatter_plot: '散点图',
            line_plot: '折线图',
            bar_chart: '柱状图',
            heatmap: '热图',
            survival_curve: '生存曲线',
            default: '图表'
        };
        
        return names[type] || names.default;
    }

    // 更新颜色信息表
    updateColorTable() {
        const tableContainer = document.getElementById('colorInfoTable');
        if (!tableContainer) return;

        const tableHtml = `
            <thead>
                <tr class="border-b border-theme bg-theme-secondary">
                    <th class="text-left p-3 font-medium text-theme-primary">颜色</th>
                    <th class="text-left p-3 font-medium text-theme-primary">名称</th>
                    <th class="text-left p-3 font-medium text-theme-primary">HEX</th>
                    <th class="text-left p-3 font-medium text-theme-primary">RGB</th>
                    <th class="text-left p-3 font-medium text-theme-primary">用途</th>
                    <th class="text-left p-3 font-medium text-theme-primary">图表</th>
                </tr>
            </thead>
            <tbody>
                ${this.currentArticle.figures.flatMap((figure, figIndex) => 
                    figure.colors.map((color, colorIndex) => `
                        <tr class="border-b border-theme hover:bg-theme-secondary transition-colors">
                            <td class="p-3">
                                <div class="w-6 h-6 md:w-8 md:h-8 rounded-lg shadow-sm border border-theme cursor-pointer" 
                                     style="background-color: ${color.hex};"
                                     onclick="articleDetail.copyColorWithFeedback(this, '${color.hex}', '${color.name}')">
                                </div>
                            </td>
                            <td class="p-3 font-medium text-theme-primary text-sm">${color.name}</td>
                            <td class="p-3">
                                <button onclick="articleDetail.copyColor('${color.hex}', '${color.name} HEX')" 
                                        class="font-mono text-xs bg-theme-tertiary hover:bg-theme-secondary px-2 py-1 rounded transition-colors">
                                    ${color.hex}
                                </button>
                            </td>
                            <td class="p-3">
                                <button onclick="articleDetail.copyColor('${color.rgb}', '${color.name} RGB')" 
                                        class="font-mono text-xs bg-theme-tertiary hover:bg-theme-secondary px-2 py-1 rounded transition-colors">
                                    ${color.rgb}
                                </button>
                            </td>
                            <td class="p-3 text-theme-secondary text-sm">${color.usage}</td>
                            <td class="p-3 text-blue-600 font-medium text-sm">${figure.name}</td>
                        </tr>
                    `)
                ).join('')}
            </tbody>
        `;
        
        tableContainer.innerHTML = tableHtml;
    }

    // 复制颜色
    copyColor(value, description) {
        if (window.uiComponents) {
            uiComponents.copyToClipboard(value, description);
        }
    }

    // 复制颜色并显示反馈
    copyColorWithFeedback(element, color, name) {
        this.copyColor(color, name);
        
        // 显示复制反馈
        element.classList.add('show-copy-feedback');
        setTimeout(() => {
            element.classList.remove('show-copy-feedback');
        }, 1000);
    }

    // 复制图表所有颜色
    copyFigureColors(figureIndex) {
        const figure = this.currentArticle.figures[figureIndex];
        if (!figure) return;
        
        const colors = figure.colors.map(c => c.hex);
        const colorString = colors.join(', ');
        this.copyColor(colorString, `${figure.name} 配色`);
    }

    // 导出图表配色
    exportFigureColors(figureIndex) {
        const figure = this.currentArticle.figures[figureIndex];
        if (!figure) return;
        
        const exportData = {
            source: {
                journal: this.currentArticle.journal,
                title: this.currentArticle.title,
                figure: figure.name,
                doi: this.currentArticle.doi,
                image_path: figure.image_path
            },
            colors: figure.colors,
            exported: new Date().toISOString(),
            format: 'Academic Color Palette v1.0'
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${figure.name.replace(/[^a-zA-Z0-9]/g, '_')}_colors.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        if (window.uiComponents) {
            uiComponents.showCopyToast('图表配色已导出');
        }
    }
}

// 创建全局文章详情实例
const articleDetail = new ArticleDetail();