// 我的配色功能模块
class MyPalettes {
    constructor() {
        this.currentPalette = ['#CB355F', '#B74D6C', '#A05D79', '#876886', '#6A7192'];
        this.originalPalette = ['#CB355F', '#B74D6C', '#A05D79', '#876886', '#6A7192'];
        this.lockedColors = new Set();
        this.savedPalettes = this.loadSavedPalettes();
        this.recommendedPalettes = [];
        
        // 新增：配色调整参数
        this.adjustments = {
            hue: 0,
            saturation: 0,
            brightness: 0,
            contrast: 0,
            temperature: 0
        };
        this.colorBlindMode = 'none';
        this.showAdjustments = false;
        this.activePreset = null; // 添加活跃预设跟踪
    }

    // 初始化
    init() {
        this.loadRecommendedPalettes();
    }

    // 加载推荐配色
    loadRecommendedPalettes() {
        this.recommendedPalettes = dataManager.getRecommendedPalettes();
    }

    // 应用调整到配色
    applyAdjustments() {
        this.currentPalette = this.originalPalette.map((color, index) => {
            if (this.lockedColors.has(index)) {
                return color;
            }
            return ColorUtils.applyColorAdjustments(color, this.adjustments, this.colorBlindMode);
        });
        this.renderMyPalette();
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
                <input type="color" value="${color}" onchange="myPalettes.updateOriginalColor(${index}, this.value)" 
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

    // 渲染配色调整面板
    renderAdjustmentPanel() {
        // 查找我的配色视图的主容器
        const myPalettesView = document.getElementById('myPalettesView');
        if (!myPalettesView) return;

        const container = myPalettesView.querySelector('.max-w-7xl');
        if (!container) return;

        // 移除现有面板
        const existingPanel = document.getElementById('adjustmentPanel');
        if (existingPanel) {
            existingPanel.remove();
        }

        // 如果不显示调整面板，直接返回
        if (!this.showAdjustments) return;

        const panel = document.createElement('div');
        panel.id = 'adjustmentPanel';
        panel.className = 'bg-theme-primary rounded-2xl shadow-lg p-6 mb-8 adjustment-panel-enter';

        panel.innerHTML = `
            <h3 class="text-lg font-bold text-theme-primary mb-6 flex items-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                配色调整
                <div class="ml-auto flex items-center text-sm text-theme-secondary">
                    <span class="mr-2">实时预览</span>
                    <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
            </h3>
            
            <!-- 第一行：色相、饱和度、亮度 -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <!-- 色相调整 -->
                <div class="adjustment-group">
                    <label class="adjustment-label">
                        <span class="label-icon">🎨</span>
                        色相 <span class="adjustment-value">${this.adjustments.hue}°</span>
                    </label>
                    <input type="range" min="-180" max="180" value="${this.adjustments.hue}" 
                           onchange="myPalettes.updateAdjustment('hue', parseInt(this.value))"
                           oninput="myPalettes.updateAdjustmentRealtime('hue', parseInt(this.value))"
                           class="adjustment-slider hue-slider">
                    <div class="slider-labels">
                        <span>-180°</span>
                        <span>0°</span>
                        <span>+180°</span>
                    </div>
                </div>

                <!-- 饱和度调整 -->
                <div class="adjustment-group">
                    <label class="adjustment-label">
                        <span class="label-icon">💧</span>
                        饱和度 <span class="adjustment-value">${this.adjustments.saturation > 0 ? '+' : ''}${this.adjustments.saturation}%</span>
                    </label>
                    <input type="range" min="-50" max="50" value="${this.adjustments.saturation}" 
                           onchange="myPalettes.updateAdjustment('saturation', parseInt(this.value))"
                           oninput="myPalettes.updateAdjustmentRealtime('saturation', parseInt(this.value))"
                           class="adjustment-slider saturation-slider">
                    <div class="slider-labels">
                        <span>-50%</span>
                        <span>0%</span>
                        <span>+50%</span>
                    </div>
                </div>

                <!-- 亮度调整 -->
                <div class="adjustment-group">
                    <label class="adjustment-label">
                        <span class="label-icon">☀️</span>
                        亮度 <span class="adjustment-value">${this.adjustments.brightness > 0 ? '+' : ''}${this.adjustments.brightness}%</span>
                    </label>
                    <input type="range" min="-50" max="50" value="${this.adjustments.brightness}" 
                           onchange="myPalettes.updateAdjustment('brightness', parseInt(this.value))"
                           oninput="myPalettes.updateAdjustmentRealtime('brightness', parseInt(this.value))"
                           class="adjustment-slider brightness-slider">
                    <div class="slider-labels">
                        <span>-50%</span>
                        <span>0%</span>
                        <span>+50%</span>
                    </div>
                </div>
            </div>

            <!-- 第二行：对比度、色温、色盲模式 -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <!-- 对比度调整 -->
                <div class="adjustment-group">
                    <label class="adjustment-label">
                        <span class="label-icon">⚡</span>
                        对比度 <span class="adjustment-value">${this.adjustments.contrast > 0 ? '+' : ''}${this.adjustments.contrast}</span>
                    </label>
                    <input type="range" min="-50" max="50" value="${this.adjustments.contrast}" 
                           onchange="myPalettes.updateAdjustment('contrast', parseInt(this.value))"
                           oninput="myPalettes.updateAdjustmentRealtime('contrast', parseInt(this.value))"
                           class="adjustment-slider contrast-slider">
                    <div class="slider-labels">
                        <span>-50</span>
                        <span>0</span>
                        <span>+50</span>
                    </div>
                </div>

                <!-- 色温调整 -->
                <div class="adjustment-group">
                    <label class="adjustment-label">
                        <span class="label-icon">🌡️</span>
                        色温 <span class="adjustment-value">${this.adjustments.temperature > 0 ? '+' : ''}${this.adjustments.temperature}</span>
                    </label>
                    <input type="range" min="-100" max="100" value="${this.adjustments.temperature}" 
                           onchange="myPalettes.updateAdjustment('temperature', parseInt(this.value))"
                           oninput="myPalettes.updateAdjustmentRealtime('temperature', parseInt(this.value))"
                           class="adjustment-slider temperature-slider">
                    <div class="slider-labels">
                        <span>冷色调</span>
                        <span>中性</span>
                        <span>暖色调</span>
                    </div>
                </div>

                <!-- 色盲模式 -->
                <div class="adjustment-group">
                    <label class="adjustment-label">
                        色盲
                    </label>
                    <div class="custom-select-wrapper">
                        <select onchange="myPalettes.setColorBlindMode(this.value)" class="custom-select">
                            <option value="none" ${this.colorBlindMode === 'none' ? 'selected' : ''}>无</option>
                            <option value="protanopia" ${this.colorBlindMode === 'protanopia' ? 'selected' : ''}>红色盲</option>
                            <option value="deuteranopia" ${this.colorBlindMode === 'deuteranopia' ? 'selected' : ''}>绿色盲</option>
                            <option value="tritanopia" ${this.colorBlindMode === 'tritanopia' ? 'selected' : ''}>蓝色盲</option>
                            <option value="achromatopsia" ${this.colorBlindMode === 'achromatopsia' ? 'selected' : ''}>全色盲</option>
                        </select>
                        <div class="select-arrow">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 快速预设 -->
            <div class="preset-section">
                <h4 class="preset-title">
                    <span class="label-icon">⚡</span>
                    快速预设
                    <span class="preset-hint">一键应用常用配色风格</span>
                </h4>
                <div class="preset-buttons">
                    <button onclick="myPalettes.applyPreset('vivid')" class="preset-btn ${this.activePreset === 'vivid' ? 'active' : ''}" data-preset="vivid">
                        <div class="preset-icon">✨</div>
                        <span>鲜艳模式</span>
                    </button>
                    <button onclick="myPalettes.applyPreset('soft')" class="preset-btn ${this.activePreset === 'soft' ? 'active' : ''}" data-preset="soft">
                        <div class="preset-icon">🌸</div>
                        <span>柔和模式</span>
                    </button>
                    <button onclick="myPalettes.applyPreset('warm')" class="preset-btn ${this.activePreset === 'warm' ? 'active' : ''}" data-preset="warm">
                        <div class="preset-icon">🔥</div>
                        <span>暖色调</span>
                    </button>
                    <button onclick="myPalettes.applyPreset('cool')" class="preset-btn ${this.activePreset === 'cool' ? 'active' : ''}" data-preset="cool">
                        <div class="preset-icon">❄️</div>
                        <span>冷色调</span>
                    </button>
                    <button onclick="myPalettes.resetAdjustments()" class="preset-btn reset-btn">
                        <div class="preset-icon">🔄</div>
                        <span>重置调整</span>
                    </button>
                </div>
            </div>
        `;

        // 找到正确的插入位置
        const paletteSection = container.querySelector('.bg-theme-primary');
        if (paletteSection && paletteSection.nextElementSibling) {
            // 插入到配色展示区后面，推荐配色区前面
            container.insertBefore(panel, paletteSection.nextElementSibling);
        } else {
            // 如果找不到合适位置，直接添加到容器末尾
            container.appendChild(panel);
        }
    }

    // 切换调整面板显示
    toggleAdjustments() {
        this.showAdjustments = !this.showAdjustments;
        this.updateAdjustmentButton(); // 先更新按钮状态
        this.renderAdjustmentPanel();
    }

    // 更新调整按钮状态
    updateAdjustmentButton() {
        // 查找配色调整按钮 - 更精确的选择器
        const myPalettesView = document.getElementById('myPalettesView');
        if (!myPalettesView) return;

        const buttons = myPalettesView.querySelectorAll('button');
        let adjustmentButton = null;
        
        buttons.forEach(button => {
            if (button.textContent && (button.textContent.includes('配色调整') || button.textContent.includes('关闭调整'))) {
                adjustmentButton = button;
            }
        });
        
        if (adjustmentButton) {
            if (this.showAdjustments) {
                adjustmentButton.className = 'flex items-center justify-center px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow-lg';
                adjustmentButton.innerHTML = `
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    关闭调整
                `;
            } else {
                adjustmentButton.className = 'flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg';
                adjustmentButton.innerHTML = `
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    配色调整
                `;
            }
        }
    }

    // 实时更新调整参数（拖拽时）
    updateAdjustmentRealtime(type, value) {
        this.adjustments[type] = value;
        this.applyAdjustments();
        
        // 清除活跃预设（自定义调整时）
        if (this.activePreset) {
            this.activePreset = null;
            this.updatePresetButtons();
        }
        
        // 更新标签显示
        this.updateAdjustmentLabel(type, value);
    }

    // 更新调整参数（最终值）
    updateAdjustment(type, value) {
        this.adjustments[type] = value;
        this.applyAdjustments();
        
        // 清除活跃预设（自定义调整时）
        if (this.activePreset) {
            this.activePreset = null;
            this.updatePresetButtons();
        }
    }

    // 更新标签显示
    updateAdjustmentLabel(type, value) {
        const panel = document.getElementById('adjustmentPanel');
        if (!panel) return;
        
        const valueSpan = panel.querySelector(`input[oninput*="${type}"]`)?.closest('.adjustment-group')?.querySelector('.adjustment-value');
        if (valueSpan) {
            const unit = type === 'hue' ? '°' : type === 'temperature' ? '' : '%';
            const prefix = value > 0 && type !== 'hue' ? '+' : '';
            valueSpan.textContent = `${prefix}${value}${unit}`;
        }
    }

    // 设置色盲模式
    setColorBlindMode(mode) {
        this.colorBlindMode = mode;
        this.applyAdjustments();
        
        // 清除活跃预设
        if (this.activePreset) {
            this.activePreset = null;
            this.updatePresetButtons();
        }
    }

    // 获取调整参数标签
    getAdjustmentLabel(type) {
        const labels = {
            hue: '色相',
            saturation: '饱和度',
            brightness: '亮度',
            contrast: '对比度',
            temperature: '色温'
        };
        return labels[type] || type;
    }

    // 应用预设
    applyPreset(preset) {
        this.activePreset = preset;
        
        switch (preset) {
            case 'vivid':
                this.adjustments = { hue: 0, saturation: 20, brightness: 10, contrast: 10, temperature: 0 };
                break;
            case 'soft':
                this.adjustments = { hue: 0, saturation: -20, brightness: 5, contrast: -10, temperature: 0 };
                break;
            case 'warm':
                this.adjustments = { hue: 0, saturation: 0, brightness: 0, contrast: 0, temperature: 30 };
                break;
            case 'cool':
                this.adjustments = { hue: 0, saturation: 0, brightness: 0, contrast: 0, temperature: -30 };
                break;
        }
        
        this.applyAdjustments();
        this.renderAdjustmentPanel();
    }

    // 更新预设按钮状态
    updatePresetButtons() {
        const panel = document.getElementById('adjustmentPanel');
        if (!panel) return;
        
        panel.querySelectorAll('.preset-btn[data-preset]').forEach(btn => {
            const preset = btn.dataset.preset;
            if (preset === this.activePreset) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // 重置调整
    resetAdjustments() {
        this.adjustments = {
            hue: 0,
            saturation: 0,
            brightness: 0,
            contrast: 0,
            temperature: 0
        };
        this.colorBlindMode = 'none';
        this.activePreset = null;
        this.applyAdjustments();
        this.renderAdjustmentPanel();
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
        const baseColor = this.originalPalette[index];
        const newColor = ColorUtils.generateHarmoniousPalette(baseColor, 2, 'analogous')[1];
        
        this.originalPalette.splice(index + 1, 0, newColor);
        this.applyAdjustments();
    }

    // 删除指定位置的颜色
    removeColorAt(index) {
        if (this.originalPalette.length <= 2) {
            if (window.uiComponents) {
                uiComponents.showCopyToast('至少需要2种颜色');
            }
            return;
        }
        
        this.originalPalette.splice(index, 1);
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
        this.applyAdjustments();
    }

    // 生成随机配色
    generateRandomPalette() {
        const paletteTypes = ['analogous', 'complementary', 'triadic', 'monochromatic'];
        const randomType = paletteTypes[Math.floor(Math.random() * paletteTypes.length)];
        const baseColor = ColorUtils.generateRandomColor();
        
        this.originalPalette = ColorUtils.generateHarmoniousPalette(baseColor, this.originalPalette.length, randomType);
        this.lockedColors.clear();
        this.applyAdjustments();
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

    // 更新原始颜色（通过颜色选择器）
    updateOriginalColor(index, color) {
        this.originalPalette[index] = color;
        this.applyAdjustments();
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
            originalColors: [...this.originalPalette],
            adjustments: { ...this.adjustments },
            colorBlindMode: this.colorBlindMode,
            activePreset: this.activePreset,
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

    // 其他现有方法保持不变...
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

    exportPalette() {
        const nameInput = document.getElementById('paletteName');
        const paletteName = nameInput?.value || `配色方案_${Date.now()}`;
        
        const paletteData = {
            name: paletteName,
            colors: this.currentPalette,
            originalColors: this.originalPalette,
            adjustments: this.adjustments,
            colorBlindMode: this.colorBlindMode,
            activePreset: this.activePreset,
            created: new Date().toISOString(),
            format: 'Academic Color Palette',
            version: '2.0.0'
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

    applyRecommendedPalette(paletteId) {
        const palette = this.recommendedPalettes.find(p => p.id === paletteId);
        if (palette) {
            this.originalPalette = [...palette.colors];
            this.lockedColors.clear();
            this.resetAdjustments();
            
            if (window.uiComponents) {
                uiComponents.showCopyToast(`已应用配色方案"${palette.name}"`);
            }
        }
    }

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

    loadSharedPalette() {
        const urlParams = new URLSearchParams(window.location.search);
        const paletteData = urlParams.get('palette');
        
        if (paletteData) {
            try {
                const shared = JSON.parse(atob(paletteData));
                this.originalPalette = shared.originalColors || shared.colors;
                this.adjustments = shared.adjustments || {
                    hue: 0, saturation: 0, brightness: 0, contrast: 0, temperature: 0
                };
                this.colorBlindMode = shared.colorBlindMode || 'none';
                this.activePreset = shared.activePreset || null;
                this.lockedColors.clear();
                this.applyAdjustments();
                
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

    savePalettesToLocal() {
        localStorage.setItem('my_palettes', JSON.stringify(this.savedPalettes));
    }

    loadSavedPalettes() {
        const saved = localStorage.getItem('my_palettes');
        return saved ? JSON.parse(saved) : [];
    }

    deleteSavedPalette(paletteId) {
        this.savedPalettes = this.savedPalettes.filter(p => p.id !== paletteId);
        this.savePalettesToLocal();
    }

    getSavedPalettes() {
        return this.savedPalettes;
    }

    analyzePaletteHarmony() {
        if (this.currentPalette.length < 2) return { score: 100, type: 'single' };
        
        const hues = this.currentPalette.map(color => {
            const hsl = ColorUtils.hexToHsl(color);
            return hsl ? hsl[0] : 0;
        });
        
        const hueDifferences = [];
        for (let i = 0; i < hues.length - 1; i++) {
            let diff = Math.abs(hues[i] - hues[i + 1]);
            if (diff > 180) diff = 360 - diff;
            hueDifferences.push(diff);
        }
        
        const avgDifference = hueDifferences.reduce((sum, diff) => sum + diff, 0) / hueDifferences.length;
        
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
