// 我的配色功能模块
class MyPalettes {
    constructor() {
        this.currentPalette = ['#CB355F', '#B74D6C', '#A05D79', '#876886', '#6A7192'];
        this.lockedColors = new Set();
        this.savedPalettes = this.loadSavedPalettes();
        this.recommendedPalettes = [];
    }

    // 初始化
    init() {
        this.loadRecommendedPalettes();
    }

    // 加载推荐配色
    loadRecommendedPalettes() {
        this.recommendedPalettes = dataManager.getRecommendedPalettes();
    }

    // 渲染我的配色
    renderMyPalette() {
        const container = document.getElementById('paletteDisplay');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.currentPalette.forEach((color, index) => {
            // 颜色块
            const colorDiv = document.createElement('div');
            colorDiv.className = `color-swatch flex-1 relative group ${this.lockedColors.has(index) ? 'locked' : ''}`;
            colorDiv.style.backgroundColor = color;
            colorDiv.style.minHeight = '300px';
            
            colorDiv.innerHTML = `
                <div class="color-controls">
                    <button onclick="myPalettes.toggleLockColor(${index})" class="control-btn" title="${this.lockedColors.has(index) ? '解锁' : '锁定'}">
                        ${this.lockedColors.has(index) ? '🔒' : '🔓'}
                    </button>
                    ${this.currentPalette.length > 2 ? `
                        <button onclick="myPalettes.removeColorAt(${index})" class="control-btn" title="删除颜色">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    ` : ''}
                </div>
                <div class="color-value" onclick="myPalettes.copyColor('${color}')">${color}</div>
                <input type="color" value="${color}" onchange="myPalettes.updateColor(${index}, this.value)" 
                       class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" style="z-index: 5;">
            `;
            
            container.appendChild(colorDiv);
            
            // 分隔符（除了最后一个颜色块）
            if (index < this.currentPalette.length - 1) {
                const separator = document.createElement('div');
                separator.className = 'color-separator';
                separator.innerHTML = `
                    <button onclick="myPalettes.addColorAt(${index})" class="add-color-btn" title="在此处添加颜色">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                    </button>
                `;
                container.appendChild(separator);
            }
        });
    }

    // 在指定位置添加颜色
    addColorAt(index) {
        if (this.currentPalette.length >= 8) {
            if (window.uiComponents) {
                uiComponents.showCopyToast('最多支持8种颜色');
            }
            return;
        }
        
        // 生成和谐的新颜色
        const baseColor = this.currentPalette[index];
        const newColor = ColorUtils.generateHarmoniousPalette(baseColor, 2, 'analogous')[1];
        
        this.currentPalette.splice(index + 1, 0, newColor);
        this.renderMyPalette();
    }

    // 删除指定位置的颜色
    removeColorAt(index) {
        if (this.currentPalette.length <= 2) {
            if (window.uiComponents) {
                uiComponents.showCopyToast('至少需要2种颜色');
            }
            return;
        }
        
        this.currentPalette.splice(index, 1);
        this.lockedColors.delete(index);
        
        // 重新调整锁定的索引
        const newLockedColors = new Set();
        this.lockedColors.forEach(lockedIndex => {
            if (lockedIndex < index) {
                newLockedColors.add(lockedIndex);
            } else if (lockedIndex > index) {
                newLockedColors.add(lockedIndex - 1);
            }
        });
        this.lockedColors = newLockedColors;
        this.renderMyPalette();
    }

    // 生成随机配色
    generateRandomPalette() {
        const paletteTypes = ['analogous', 'complementary', 'triadic', 'monochromatic'];
        const randomType = paletteTypes[Math.floor(Math.random() * paletteTypes.length)];
        const baseColor = ColorUtils.generateRandomColor();
        
        this.currentPalette = this.currentPalette.map((color, index) => {
            if (this.lockedColors.has(index)) {
                return color;
            }
            
            // 生成和谐配色
            const newPalette = ColorUtils.generateHarmoniousPalette(baseColor, this.currentPalette.length, randomType);
            return newPalette[index] || ColorUtils.generateRandomColor();
        });
        
        this.renderMyPalette();
    }

    // 切换颜色锁定状态
    toggleLockColor(index) {
        if (this.lockedColors.has(index)) {
            this.lockedColors.delete(index);
        } else {
            this.lockedColors.add(index);
        }
        this.renderMyPalette();
    }

    // 更新颜色
    updateColor(index, color) {
        this.currentPalette[index] = color;
        this.renderMyPalette();
    }

    // 复制颜色
    copyColor(color) {
        if (window.uiComponents) {
            uiComponents.copyToClipboard(color, '配色值');
        }
    }

    // 保存配色方案
    savePalette() {
        const nameInput = document.getElementById('paletteName');
        const paletteName = nameInput?.value || `配色方案_${Date.now()}`;
        
        const paletteData = {
            id: Date.now(),
            name: paletteName,
            colors: [...this.currentPalette],
            created: new Date().toISOString(),
            tags: this.generatePaletteTags()
        };
        
        this.savedPalettes.push(paletteData);
        this.savePalettesToLocal();
        
        if (nameInput) nameInput.value = '';
        
        if (window.uiComponents) {
            uiComponents.showCopyToast(`配色方案"${paletteName}"已保存`);
        }
    }

    // 生成配色标签
    generatePaletteTags() {
        const tags = [];
        
        // 根据颜色数量
        tags.push(`${this.currentPalette.length}色`);
        
        // 根据色调分析
        const hues = this.currentPalette.map(color => {
            const hsl = ColorUtils.hexToHsl(color);
            return hsl ? hsl[0] : 0;
        });
        
        const avgHue = hues.reduce((sum, hue) => sum + hue, 0) / hues.length;
        
        if (avgHue < 30 || avgHue > 330) tags.push('红色系');
        else if (avgHue < 90) tags.push('橙黄系');
        else if (avgHue < 150) tags.push('绿色系');
        else if (avgHue < 210) tags.push('青色系');
        else if (avgHue < 270) tags.push('蓝色系');
        else tags.push('紫色系');
        
        // 根据饱和度
        const saturations = this.currentPalette.map(color => {
            const hsl = ColorUtils.hexToHsl(color);
            return hsl ? hsl[1] : 0;
        });
        const avgSaturation = saturations.reduce((sum, sat) => sum + sat, 0) / saturations.length;
        
        if (avgSaturation > 70) tags.push('高饱和');
        else if (avgSaturation < 30) tags.push('低饱和');
        
        return tags;
    }

    // 导出配色方案
    exportPalette() {
        const nameInput = document.getElementById('paletteName');
        const paletteName = nameInput?.value || `配色方案_${Date.now()}`;
        
        const paletteData = {
            name: paletteName,
            colors: this.currentPalette,
            created: new Date().toISOString(),
            format: 'Academic Color Palette',
            version: '1.0.0'
        };
        
        const dataStr = JSON.stringify(paletteData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${paletteName.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        if (window.uiComponents) {
            uiComponents.showCopyToast('配色方案已导出到本地');
        }
    }

    // 分享配色方案
    sharePalette() {
        const nameInput = document.getElementById('paletteName');
        const paletteName = nameInput?.value || `配色方案_${Date.now()}`;
        
        // 生成分享链接（实际应用中可以上传到服务器）
        const shareData = {
            name: paletteName,
            colors: this.currentPalette,
            timestamp: Date.now()
        };
        
        const shareUrl = `${window.location.origin}${window.location.pathname}?palette=${btoa(JSON.stringify(shareData))}`;
        
        // 复制分享链接
        if (window.uiComponents) {
            uiComponents.copyToClipboard(shareUrl, '分享链接');
            uiComponents.showCopyToast('配色方案已推荐到配色市场！分享链接已复制');
        }
    }

    // 渲染推荐配色
    renderRecommendedPalettes() {
        const container = document.getElementById('recommendedPalettes');
        if (!container) return;
        
        container.innerHTML = this.recommendedPalettes.map((palette, index) => `
            <div class="palette-card slide-in" style="animation-delay: ${index * 0.1}s;">
                <div class="palette-colors">
                    ${palette.colors.map((color, colorIndex) => `
                        <div class="palette-color-item flex-1" 
                             style="background-color: ${color};"
                             oncontextmenu="uiComponents.showColorContextMenu(event, '${color}', 'rgb(${ColorUtils.hexToRgb(color)?.join(', ') || '0, 0, 0'})', '配色${colorIndex + 1}'); return false;"
                             onclick="myPalettes.copyColor('${color}')">
                        </div>
                    `).join('')}
                </div>
                <div class="palette-info">
                    <div>
                        <h4 class="font-semibold text-theme-primary">${palette.name}</h4>
                        <p class="text-xs text-theme-secondary mt-1">${palette.description || ''}</p>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button onclick="myPalettes.applyRecommendedPalette(${palette.id})" class="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors">
                            应用
                        </button>
                        <button onclick="myPalettes.likePalette(${palette.id})" class="heart-btn">
                            <svg class="heart-icon ${palette.liked ? 'liked' : 'unliked'}" viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                            <span class="text-sm ${palette.liked ? 'text-red-500' : 'text-gray-500'}">${palette.likes}</span>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // 应用推荐配色
    applyRecommendedPalette(paletteId) {
        const palette = this.recommendedPalettes.find(p => p.id === paletteId);
        if (palette) {
            this.currentPalette = [...palette.colors];
            this.lockedColors.clear();
            this.renderMyPalette();
            
            if (window.uiComponents) {
                uiComponents.showCopyToast(`已应用配色方案"${palette.name}"`);
            }
        }
    }

    // 点赞配色
    likePalette(paletteId) {
        const palette = this.recommendedPalettes.find(p => p.id === paletteId);
        if (palette) {
            if (!palette.liked) {
                palette.likes++;
                palette.liked = true;
                if (window.uiComponents) {
                    uiComponents.showCopyToast('已点赞！❤️');
                }
            } else {
                palette.likes--;
                palette.liked = false;
                if (window.uiComponents) {
                    uiComponents.showCopyToast('取消点赞');
                }
            }
            this.renderRecommendedPalettes();
        }
    }

    // 从URL加载分享的配色
    loadSharedPalette() {
        const urlParams = new URLSearchParams(window.location.search);
        const paletteData = urlParams.get('palette');
        
        if (paletteData) {
            try {
                const shared = JSON.parse(atob(paletteData));
                this.currentPalette = shared.colors;
                this.lockedColors.clear();
                this.renderMyPalette();
                
                const nameInput = document.getElementById('paletteName');
                if (nameInput) {
                    nameInput.value = shared.name;
                }
                
                if (window.uiComponents) {
                    uiComponents.showCopyToast(`已加载分享的配色方案"${shared.name}"`);
                }
            } catch (error) {
                console.error('加载分享配色失败:', error);
            }
        }
    }

    // 保存到本地存储
    savePalettesToLocal() {
        localStorage.setItem('my_palettes', JSON.stringify(this.savedPalettes));
    }

    // 从本地存储加载
    loadSavedPalettes() {
        const saved = localStorage.getItem('my_palettes');
        return saved ? JSON.parse(saved) : [];
    }

    // 删除保存的配色
    deleteSavedPalette(paletteId) {
        this.savedPalettes = this.savedPalettes.filter(p => p.id !== paletteId);
        this.savePalettesToLocal();
    }

    // 获取保存的配色列表
    getSavedPalettes() {
        return this.savedPalettes;
    }

    // 分析配色和谐度
    analyzePaletteHarmony() {
        if (this.currentPalette.length < 2) return { score: 100, type: 'single' };
        
        const hues = this.currentPalette.map(color => {
            const hsl = ColorUtils.hexToHsl(color);
            return hsl ? hsl[0] : 0;
        });
        
        // 计算色相差异
        const hueDifferences = [];
        for (let i = 0; i < hues.length - 1; i++) {
            let diff = Math.abs(hues[i] - hues[i + 1]);
            if (diff > 180) diff = 360 - diff;
            hueDifferences.push(diff);
        }
        
        const avgDifference = hueDifferences.reduce((sum, diff) => sum + diff, 0) / hueDifferences.length;
        
        // 判断配色类型和和谐度
        let type = 'custom';
        let score = 100;
        
        if (avgDifference < 30) {
            type = 'analogous';
            score = 95;
        } else if (Math.abs(avgDifference - 120) < 20) {
            type = 'triadic';
            score = 90;
        } else if (Math.abs(avgDifference - 180) < 20) {
            type = 'complementary';
            score = 85;
        } else {
            score = Math.max(50, 100 - avgDifference / 2);
        }
        
        return { score: Math.round(score), type, avgDifference: Math.round(avgDifference) };
    }
}

// 创建全局我的配色实例
const myPalettes = new MyPalettes();

// 全局函数（为了兼容HTML中的onclick）
function generateRandomPalette() {
    myPalettes.generateRandomPalette();
}

function savePalette() {
    myPalettes.savePalette();
}

function exportPalette() {
    myPalettes.exportPalette();
}

function sharePalette() {
    myPalettes.sharePalette();
}