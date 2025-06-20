// 配色预览工具模块
class PreviewTool {
    constructor() {
        this.currentColors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728'];
        this.charts = {};
        this.colorSchemes = {
            default: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728'],
            nature: ['#2563eb', '#059669', '#dc2626', '#7c3aed'],
            medical: ['#dc2626', '#ea580c', '#059669', '#7c3aed'],
            physics: ['#2563eb', '#0891b2', '#6366f1', '#8b5cf6']
        };
    }

    // 初始化预览工具
    init() {
        this.setupEventListeners();
        this.initColors();
    }

    // 设置事件监听器
    setupEventListeners() {
        const colorCountSelect = document.getElementById('previewColorCount');
        const colorSchemeSelect = document.getElementById('colorScheme');

        if (colorCountSelect) {
            colorCountSelect.addEventListener('change', () => this.updateCharts());
        }

        if (colorSchemeSelect) {
            colorSchemeSelect.addEventListener('change', () => this.applyColorScheme());
        }
    }

    // 初始化颜色
    initColors() {
        this.currentColors = [...this.colorSchemes.default];
        this.generateColorPickers();
    }

    // 生成颜色选择器
    generateColorPickers() {
        const container = document.getElementById('colorPickers');
        if (!container) return;
        
        const count = parseInt(document.getElementById('previewColorCount')?.value || 4);
        
        // 确保有足够的颜色
        while (this.currentColors.length < count) {
            this.currentColors.push(ColorUtils.generateRandomColor());
        }
        
        container.innerHTML = this.currentColors.slice(0, count).map((color, i) => `
            <div class="flex flex-col items-center">
                <input type="color" value="${color}" onchange="previewTool.updateColor(${i}, this.value)" class="color-picker">
                <span class="text-xs text-theme-secondary mt-2 font-mono">${color}</span>
            </div>
        `).join('');
    }

    // 更新单个颜色
    updateColor(index, color) {
        this.currentColors[index] = color;
        this.generateColorPickers();
        this.updateCharts();
    }

    // 应用配色方案
    applyColorScheme() {
        const scheme = document.getElementById('colorScheme')?.value;
        
        if (scheme === 'custom') {
            return;
        }
        
        if (this.colorSchemes[scheme]) {
            this.currentColors = [...this.colorSchemes[scheme]];
            this.generateColorPickers();
            this.updateCharts();
        }
    }

    // 更新所有图表
    updateCharts() {
        const count = parseInt(document.getElementById('previewColorCount')?.value || 4);
        const colors = this.currentColors.slice(0, count);
        
        this.generateColorPickers();
        
        // 销毁现有图表
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        
        // 创建新图表
        this.createLineChart(colors);
        this.createScatterChart(colors);
        this.createBarChart(colors);
        this.createPieChart(colors);
    }

    // 创建折线图
    createLineChart(colors) {
        const ctx = document.getElementById('lineChart');
        if (!ctx) return;
        
        this.charts.line = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: colors.map((color, i) => ({
                    label: `Series ${i + 1}`,
                    data: Array(7).fill().map(() => Math.floor(Math.random() * 40) + 10),
                    borderColor: color,
                    backgroundColor: color + '20',
                    tension: 0.4,
                    fill: false,
                    pointBackgroundColor: color,
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                    legend: { 
                        position: 'top', 
                        labels: { 
                            usePointStyle: true,
                            padding: 15
                        } 
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: { 
                    y: { 
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }

    // 创建散点图
    createScatterChart(colors) {
        const ctx = document.getElementById('scatterChart');
        if (!ctx) return;
        
        this.charts.scatter = new Chart(ctx.getContext('2d'), {
            type: 'scatter',
            data: {
                datasets: colors.map((color, i) => ({
                    label: `Group ${i + 1}`,
                    data: Array(20).fill().map(() => ({
                        x: Math.random() * 50,
                        y: Math.random() * 50
                    })),
                    backgroundColor: color + '80',
                    borderColor: color,
                    borderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                    legend: { 
                        position: 'top', 
                        labels: { 
                            usePointStyle: true,
                            padding: 15
                        } 
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    }
                }
            }
        });
    }

    // 创建柱状图
    createBarChart(colors) {
        const ctx = document.getElementById('barChart');
        if (!ctx) return;
        
        this.charts.bar = new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: colors.map((_, i) => `Category ${i + 1}`),
                datasets: [{
                    data: colors.map(() => Math.floor(Math.random() * 40) + 10),
                    backgroundColor: colors.map(color => color + '80'),
                    borderColor: colors,
                    borderWidth: 2,
                    borderRadius: 4,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                    legend: { 
                        display: false 
                    }
                },
                scales: { 
                    y: { 
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    // 创建饼图
    createPieChart(colors) {
        const ctx = document.getElementById('pieChart');
        if (!ctx) return;
        
        this.charts.pie = new Chart(ctx.getContext('2d'), {
            type: 'pie',
            data: {
                labels: colors.map((_, i) => `Segment ${i + 1}`),
                datasets: [{
                    data: colors.map(() => Math.floor(Math.random() * 30) + 10),
                    backgroundColor: colors,
                    borderColor: '#ffffff',
                    borderWidth: 3,
                    hoverBorderWidth: 4,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                    legend: { 
                        position: 'right', 
                        labels: { 
                            usePointStyle: true,
                            padding: 15,
                            generateLabels: function(chart) {
                                const data = chart.data;
                                if (data.labels.length && data.datasets.length) {
                                    return data.labels.map((label, i) => {
                                        const value = data.datasets[0].data[i];
                                        const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                                        const percentage = ((value / total) * 100).toFixed(1);
                                        return {
                                            text: `${label} (${percentage}%)`,
                                            fillStyle: data.datasets[0].backgroundColor[i],
                                            strokeStyle: data.datasets[0].borderColor,
                                            lineWidth: data.datasets[0].borderWidth,
                                            pointStyle: 'circle',
                                            hidden: false,
                                            index: i
                                        };
                                    });
                                }
                                return [];
                            }
                        }
                    }
                }
            }
        });
    }

    // 重置颜色
    resetColors() {
        this.currentColors = [...this.colorSchemes.default];
        this.updateCharts();
    }

    // 随机生成颜色
    randomColors() {
        const count = parseInt(document.getElementById('previewColorCount')?.value || 4);
        
        // 生成和谐的随机配色
        const baseColor = ColorUtils.generateRandomColor();
        this.currentColors = ColorUtils.generateHarmoniousPalette(baseColor, count, 'analogous');
        
        this.updateCharts();
    }

    // 复制当前配色
    copyCurrentColors() {
        const count = parseInt(document.getElementById('previewColorCount')?.value || 4);
        const colors = this.currentColors.slice(0, count);
        const colorString = colors.join(', ');
        
        if (window.uiComponents) {
            uiComponents.copyToClipboard(colorString, '预览配色');
        }
    }

    // 导出配色方案
    exportColors(format = 'json') {
        const count = parseInt(document.getElementById('previewColorCount')?.value || 4);
        const colors = this.currentColors.slice(0, count);
        
        const exportData = ColorUtils.exportPalette(colors, format);
        
        // 创建下载
        const blob = new Blob([exportData], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `color-palette.${format}`;
        link.click();
        URL.revokeObjectURL(url);
        
        if (window.uiComponents) {
            uiComponents.showCopyToast(`配色方案已导出为 ${format.toUpperCase()} 格式`);
        }
    }

    // 从图片提取配色
    async extractColorsFromImage(imageFile) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const colors = this.extractDominantColors(imageData, 5);
                resolve(colors);
            };
            
            img.onerror = reject;
            img.src = URL.createObjectURL(imageFile);
        });
    }

    // 提取主要颜色（简化版K-means聚类）
    extractDominantColors(imageData, k) {
        const pixels = [];
        const data = imageData.data;
        
        // 采样像素（每10个像素采样一个以提高性能）
        for (let i = 0; i < data.length; i += 40) {
            pixels.push([data[i], data[i + 1], data[i + 2]]);
        }
        
        // 简化的聚类算法
        const centroids = [];
        for (let i = 0; i < k; i++) {
            const randomPixel = pixels[Math.floor(Math.random() * pixels.length)];
            centroids.push([...randomPixel]);
        }
        
        // 迭代优化
        for (let iter = 0; iter < 10; iter++) {
            const clusters = Array(k).fill().map(() => []);
            
            pixels.forEach(pixel => {
                let minDistance = Infinity;
                let closestCentroid = 0;
                
                centroids.forEach((centroid, index) => {
                    const distance = Math.sqrt(
                        Math.pow(pixel[0] - centroid[0], 2) +
                        Math.pow(pixel[1] - centroid[1], 2) +
                        Math.pow(pixel[2] - centroid[2], 2)
                    );
                    
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestCentroid = index;
                    }
                });
                
                clusters[closestCentroid].push(pixel);
            });
            
            // 更新聚类中心
            clusters.forEach((cluster, index) => {
                if (cluster.length > 0) {
                    const avgR = cluster.reduce((sum, p) => sum + p[0], 0) / cluster.length;
                    const avgG = cluster.reduce((sum, p) => sum + p[1], 0) / cluster.length;
                    const avgB = cluster.reduce((sum, p) => sum + p[2], 0) / cluster.length;
                    centroids[index] = [Math.round(avgR), Math.round(avgG), Math.round(avgB)];
                }
            });
        }
        
        return centroids.map(rgb => ColorUtils.rgbToHex(...rgb));
    }

    // 应用从图片提取的配色
    applyExtractedColors(colors) {
        this.currentColors = colors;
        this.updateCharts();
        
        if (window.uiComponents) {
            uiComponents.showCopyToast('已应用图片配色方案');
        }
    }
}

// 创建全局预览工具实例
const previewTool = new PreviewTool();

// 全局函数（为了兼容HTML中的onclick）
function resetColors() {
    previewTool.resetColors();
}

function randomColors() {
    previewTool.randomColors();
}

function copyCurrentColors() {
    previewTool.copyCurrentColors();
}