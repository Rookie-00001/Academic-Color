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
        this.selectedCharts = {
            lineChart: true,
            scatterChart: true,
            barChart: true,
            pieChart: true,
            sankeyChart: false,
            violinChart: false,
            areaChart: false,
            densityChart: false,
            ridgelineChart: false,
            boxChart: false
        };
        this.animationFrames = {};
    }

    // 初始化预览工具
    init() {
        this.setupEventListeners();
        this.initColors();
        // 初始化时创建默认图表
        setTimeout(() => {
            this.updateCharts();
        }, 100);
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

        // 监听窗口大小变化
        window.addEventListener('resize', () => {
            setTimeout(() => this.updateCharts(), 100);
        });
    }

    // 初始化颜色
    initColors() {
        this.currentColors = [...this.colorSchemes.default];
        this.generateColorPickers();
    }

    // 切换图表显示
    toggleChart(chartId) {
        this.selectedCharts[chartId] = !this.selectedCharts[chartId];
        const container = document.getElementById(chartId + 'Container');
        
        if (this.selectedCharts[chartId]) {
            // 显示图表
            if (container) {
                container.classList.remove('hidden');
                // 创建图表
                setTimeout(() => {
                    const colors = this.currentColors.slice(0, parseInt(document.getElementById('previewColorCount')?.value || 4));
                    this.createChart(chartId, colors);
                }, 50);
            }
        } else {
            // 隐藏图表
            if (container) {
                container.classList.add('hidden');
                // 销毁图表
                if (this.charts[chartId]) {
                    this.charts[chartId].destroy();
                    delete this.charts[chartId];
                }
                // 取消动画
                if (this.animationFrames[chartId]) {
                    cancelAnimationFrame(this.animationFrames[chartId]);
                    delete this.animationFrames[chartId];
                }
            }
        }
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
            if (chart && chart.destroy) {
                chart.destroy();
            }
        });
        this.charts = {};
        
        // 取消所有动画
        Object.keys(this.animationFrames).forEach(chartId => {
            cancelAnimationFrame(this.animationFrames[chartId]);
            delete this.animationFrames[chartId];
        });
        
        // 创建选中的图表
        Object.keys(this.selectedCharts).forEach(chartId => {
            if (this.selectedCharts[chartId]) {
                setTimeout(() => {
                    this.createChart(chartId, colors);
                }, 50);
            }
        });
    }

    // 创建图表
    createChart(chartId, colors) {
        const ctx = document.getElementById(chartId);
        if (!ctx) return;

        switch (chartId) {
            case 'lineChart':
                this.createLineChart(colors);
                break;
            case 'scatterChart':
                this.createScatterChart(colors);
                break;
            case 'barChart':
                this.createBarChart(colors);
                break;
            case 'pieChart':
                this.createPieChart(colors);
                break;
            case 'sankeyChart':
                this.createSankeyChart(colors);
                break;
            case 'violinChart':
                this.createViolinChart(colors);
                break;
            case 'areaChart':
                this.createAreaChart(colors);
                break;
            case 'densityChart':
                this.createDensityChart(colors);
                break;
            case 'ridgelineChart':
                this.createRidgelineChart(colors);
                break;
            case 'boxChart':
                this.createBoxChart(colors);
                break;
        }
    }

    // 创建折线图
    createLineChart(colors) {
        const ctx = document.getElementById('lineChart');
        if (!ctx) return;
        
        this.charts.lineChart = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: colors.map((color, i) => ({
                    label: `Series ${i + 1}`,
                    data: Array(7).fill().map(() => Math.floor(Math.random() * 40) + 10),
                    borderColor: color,
                    backgroundColor: color,
                    tension: 0.4,
                    fill: false,
                    pointBackgroundColor: color,
                    pointBorderColor: color,
                    pointBorderWidth: 0,
                    pointRadius: 4,
                    borderWidth: 3
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                    legend: { position: 'top', labels: { usePointStyle: true, padding: 15 } },
                    tooltip: { mode: 'index', intersect: false }
                },
                scales: { 
                    y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.1)' } },
                    x: { grid: { color: 'rgba(0,0,0,0.1)' } }
                }
            }
        });
    }

    // 创建散点图（修改为聚集分布）
    createScatterChart(colors) {
        const ctx = document.getElementById('scatterChart');
        if (!ctx) return;
        
        this.charts.scatterChart = new Chart(ctx.getContext('2d'), {
            type: 'scatter',
            data: {
                datasets: colors.map((color, i) => {
                    // 为每个组设置不同的中心点
                    const centerX = 20 + i * 15 + (Math.random() - 0.5) * 10;
                    const centerY = 25 + (Math.random() - 0.5) * 20;
                    const spread = 8; // 控制聚集程度
                    
                    return {
                        label: `Group ${i + 1}`,
                        data: Array(25).fill().map(() => {
                            // 使用正态分布让点聚集在中心周围
                            const angle = Math.random() * 2 * Math.PI;
                            const radius = Math.abs(Math.random() + Math.random() - 1) * spread; // 近似正态分布
                            
                            return {
                                x: centerX + Math.cos(angle) * radius,
                                y: centerY + Math.sin(angle) * radius
                            };
                        }),
                        backgroundColor: color,
                        borderColor: color,
                        borderWidth: 0,
                        pointRadius: 5,
                        pointHoverRadius: 7
                    };
                })
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                    legend: { position: 'top', labels: { usePointStyle: true, padding: 15 } },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: (${context.parsed.x.toFixed(1)}, ${context.parsed.y.toFixed(1)})`;
                            }
                        }
                    }
                },
                scales: {
                    x: { 
                        type: 'linear', 
                        position: 'bottom', 
                        grid: { color: 'rgba(0,0,0,0.1)' },
                        title: { display: true, text: 'X轴' }
                    },
                    y: { 
                        grid: { color: 'rgba(0,0,0,0.1)' },
                        title: { display: true, text: 'Y轴' }
                    }
                }
            }
        });
    }

    // 创建柱状图
    createBarChart(colors) {
        const ctx = document.getElementById('barChart');
        if (!ctx) return;
        
        this.charts.barChart = new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: colors.map((_, i) => `Category ${i + 1}`),
                datasets: [{
                    data: colors.map(() => Math.floor(Math.random() * 40) + 10),
                    backgroundColor: colors,
                    borderColor: colors,
                    borderWidth: 0,
                    borderRadius: 4,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { 
                    y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.1)' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    // 创建饼图
    createPieChart(colors) {
        const ctx = document.getElementById('pieChart');
        if (!ctx) return;
        
        this.charts.pieChart = new Chart(ctx.getContext('2d'), {
            type: 'pie',
            data: {
                labels: colors.map((_, i) => `Segment ${i + 1}`),
                datasets: [{
                    data: colors.map(() => Math.floor(Math.random() * 30) + 10),
                    backgroundColor: colors,
                    borderColor: colors,
                    borderWidth: 0,
                    hoverBorderWidth: 0,
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
                                            strokeStyle: data.datasets[0].backgroundColor[i],
                                            lineWidth: 0,
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

    // 创建桑基图（重新优化）
    createSankeyChart(colors) {
        const canvas = document.getElementById('sankeyChart');
        if (!canvas) return;
        
        // 设置Canvas尺寸
        const container = canvas.parentElement;
        const containerRect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        canvas.width = containerRect.width * dpr;
        canvas.height = 200 * dpr;
        canvas.style.width = containerRect.width + 'px';
        canvas.style.height = '200px';
        
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        
        const width = containerRect.width;
        const height = 200;
        const nodeWidth = 50;
        const padding = 60;
        
        // 定义节点
        const nodes = [
            { name: 'Source A', x: padding, y: height * 0.15, height: 50, value: 100 },
            { name: 'Source B', x: padding, y: height * 0.45, height: 40, value: 80 },
            { name: 'Source C', x: padding, y: height * 0.75, height: 35, value: 60 },
            { name: 'Target 1', x: width - padding - nodeWidth, y: height * 0.25, height: 60, value: 120 },
            { name: 'Target 2', x: width - padding - nodeWidth, y: height * 0.65, height: 50, value: 100 }
        ];
        
        // 定义连接
        const links = [
            { source: 0, target: 3, value: 60, color: colors[0] },
            { source: 0, target: 4, value: 40, color: colors[0] },
            { source: 1, target: 3, value: 40, color: colors[1] },
            { source: 1, target: 4, value: 40, color: colors[1] },
            { source: 2, target: 4, value: 60, color: colors[2] }
        ];
        
        ctx.clearRect(0, 0, width, height);
        
        // 绘制连接流
        links.forEach(link => {
            const sourceNode = nodes[link.source];
            const targetNode = nodes[link.target];
            const thickness = (link.value / 100) * 30;
            
            const sourceX = sourceNode.x + nodeWidth;
            const sourceY = sourceNode.y + sourceNode.height / 2;
            const targetX = targetNode.x;
            const targetY = targetNode.y + targetNode.height / 2;
            
            // 创建流的路径
            ctx.fillStyle = link.color;
            ctx.beginPath();
            
            // 计算贝塞尔曲线控制点
            const cpOffset = (targetX - sourceX) * 0.6;
            const cp1x = sourceX + cpOffset;
            const cp2x = targetX - cpOffset;
            
            // 上边缘
            ctx.moveTo(sourceX, sourceY - thickness / 2);
            ctx.bezierCurveTo(cp1x, sourceY - thickness / 2, cp2x, targetY - thickness / 2, targetX, targetY - thickness / 2);
            
            // 下边缘
            ctx.lineTo(targetX, targetY + thickness / 2);
            ctx.bezierCurveTo(cp2x, targetY + thickness / 2, cp1x, sourceY + thickness / 2, sourceX, sourceY + thickness / 2);
            
            ctx.closePath();
            ctx.fill();
        });
        
        // 绘制节点
        nodes.forEach((node, index) => {
            ctx.fillStyle = colors[index % colors.length];
            ctx.fillRect(node.x, node.y, nodeWidth, node.height);
            
            // 节点标签
            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.textAlign = node.x < width / 2 ? 'left' : 'right';
            const labelX = node.x + (node.x < width / 2 ? nodeWidth + 10 : -10);
            ctx.fillText(node.name, labelX, node.y + node.height / 2 + 4);
        });
        
        this.charts.sankeyChart = {
            destroy: () => {
                ctx.clearRect(0, 0, width, height);
            }
        };
    }

    // 创建小提琴图（重新优化）
    createViolinChart(colors) {
        const canvas = document.getElementById('violinChart');
        if (!canvas) return;
        
        const container = canvas.parentElement;
        const containerRect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        canvas.width = containerRect.width * dpr;
        canvas.height = 200 * dpr;
        canvas.style.width = containerRect.width + 'px';
        canvas.style.height = '200px';
        
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        
        const width = containerRect.width;
        const height = 200;
        const padding = 40;
        const plotWidth = width - 2 * padding;
        const plotHeight = height - 2 * padding;
        
        ctx.clearRect(0, 0, width, height);
        
        const groupWidth = plotWidth / colors.length;
        const maxWidth = groupWidth * 0.7;
        
        // 绘制背景网格
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = padding + (i / 4) * plotHeight;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }
        
        colors.forEach((color, groupIndex) => {
            // 生成正态分布数据
            const data = [];
            const mean = 50 + (Math.random() - 0.5) * 20;
            const std = 12 + Math.random() * 8;
            
            for (let i = 0; i < 800; i++) {
                const u1 = Math.random();
                const u2 = Math.random();
                const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
                const value = mean + z * std;
                if (value > 0 && value < 100) data.push(value);
            }
            
            // 计算密度分布
            const bins = 40;
            const binSize = 100 / bins;
            const histogram = new Array(bins).fill(0);
            
            data.forEach(value => {
                const binIndex = Math.floor(value / binSize);
                if (binIndex >= 0 && binIndex < bins) {
                    histogram[binIndex]++;
                }
            });
            
            const maxCount = Math.max(...histogram);
            const centerX = padding + groupIndex * groupWidth + groupWidth / 2;
            
            // 绘制小提琴形状
            ctx.fillStyle = color;
            ctx.beginPath();
            
            // 右侧轮廓
            let firstPoint = true;
            for (let i = 0; i < bins; i++) {
                const y = padding + plotHeight - (i / bins) * plotHeight;
                const width = (histogram[i] / maxCount) * maxWidth / 2;
                const x = centerX + width;
                
                if (firstPoint) {
                    ctx.moveTo(centerX, y);
                    firstPoint = false;
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            // 左侧轮廓（镜像）
            for (let i = bins - 1; i >= 0; i--) {
                const y = padding + plotHeight - (i / bins) * plotHeight;
                const width = (histogram[i] / maxCount) * maxWidth / 2;
                const x = centerX - width;
                ctx.lineTo(x, y);
            }
            
            ctx.closePath();
            ctx.fill();
            
            // 添加中位数线
            const medianValue = data.sort((a, b) => a - b)[Math.floor(data.length / 2)];
            const medianY = padding + plotHeight - (medianValue / 100) * plotHeight;
            
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(centerX - maxWidth / 4, medianY);
            ctx.lineTo(centerX + maxWidth / 4, medianY);
            ctx.stroke();
            
            // 标签
            ctx.fillStyle = '#333';
            ctx.font = '11px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`Group ${groupIndex + 1}`, centerX, height - padding + 18);
        });
        
        // 绘制坐标轴
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();
        
        // Y轴标签
        ctx.fillStyle = '#666';
        ctx.font = '10px Arial';
        ctx.textAlign = 'right';
        for (let i = 0; i <= 4; i++) {
            const value = 100 - (i / 4) * 100;
            const y = padding + (i / 4) * plotHeight;
            ctx.fillText(value.toFixed(0), padding - 8, y + 3);
        }
        
        this.charts.violinChart = {
            destroy: () => {
                ctx.clearRect(0, 0, width, height);
            }
        };
    }

    // 创建箱型图（重新优化）
    createBoxChart(colors) {
        const canvas = document.getElementById('boxChart');
        if (!canvas) return;
        
        const container = canvas.parentElement;
        const containerRect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        canvas.width = containerRect.width * dpr;
        canvas.height = 200 * dpr;
        canvas.style.width = containerRect.width + 'px';
        canvas.style.height = '200px';
        
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        
        const width = containerRect.width;
        const height = 200;
        const padding = 40;
        const plotWidth = width - 2 * padding;
        const plotHeight = height - 2 * padding;
        
        ctx.clearRect(0, 0, width, height);
        
        // 生成箱型图数据
        const boxData = colors.map((color, index) => {
            const data = Array(300).fill().map(() => {
                const mean = 50 + index * 8;
                const std = 15;
                const u1 = Math.random();
                const u2 = Math.random();
                const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
                return mean + z * std;
            }).sort((a, b) => a - b);
            
            const q1 = data[Math.floor(data.length * 0.25)];
            const median = data[Math.floor(data.length * 0.5)];
            const q3 = data[Math.floor(data.length * 0.75)];
            const iqr = q3 - q1;
            const min = Math.max(data[0], q1 - 1.5 * iqr);
            const max = Math.min(data[data.length - 1], q3 + 1.5 * iqr);
            const outliers = data.filter(d => d < min || d > max);
            
            return { min, q1, median, q3, max, outliers, color };
        });
        
        const allValues = boxData.flatMap(d => [d.min, d.max, ...d.outliers]);
        const minValue = Math.min(...allValues) - 5;
        const maxValue = Math.max(...allValues) + 5;
        const valueRange = maxValue - minValue;
        
        const getY = (value) => padding + plotHeight - ((value - minValue) / valueRange) * plotHeight;
        
        // 绘制背景网格
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const value = minValue + (valueRange * i / 4);
            const y = getY(value);
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }
        
        const boxWidth = Math.min(plotWidth / (colors.length * 2), 50);
        
        boxData.forEach((box, index) => {
            const x = padding + plotWidth * (index + 0.5) / colors.length;
            
            // 绘制箱体
            ctx.fillStyle = box.color;
            const boxTop = getY(box.q3);
            const boxBottom = getY(box.q1);
            const boxHeight = boxBottom - boxTop;
            
            ctx.fillRect(x - boxWidth / 2, boxTop, boxWidth, boxHeight);
            
            // 绘制中位数线
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x - boxWidth / 2, getY(box.median));
            ctx.lineTo(x + boxWidth / 2, getY(box.median));
            ctx.stroke();
            
            // 绘制须线
            ctx.strokeStyle = box.color;
            ctx.lineWidth = 2;
            
            // 上须线
            ctx.beginPath();
            ctx.moveTo(x, boxTop);
            ctx.lineTo(x, getY(box.max));
            ctx.moveTo(x - boxWidth / 4, getY(box.max));
            ctx.lineTo(x + boxWidth / 4, getY(box.max));
            ctx.stroke();
            
            // 下须线
            ctx.beginPath();
            ctx.moveTo(x, boxBottom);
            ctx.lineTo(x, getY(box.min));
            ctx.moveTo(x - boxWidth / 4, getY(box.min));
            ctx.lineTo(x + boxWidth / 4, getY(box.min));
            ctx.stroke();
            
            // 绘制离群点
            ctx.fillStyle = box.color;
            box.outliers.forEach(outlier => {
                ctx.beginPath();
                ctx.arc(x, getY(outlier), 3, 0, 2 * Math.PI);
                ctx.fill();
            });
            
            // 标签
            ctx.fillStyle = '#333';
            ctx.font = '11px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`Group ${index + 1}`, x, height - padding + 18);
        });
        
        // 绘制坐标轴
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();
        
        // Y轴刻度和标签
        ctx.fillStyle = '#666';
        ctx.font = '10px Arial';
        ctx.textAlign = 'right';
        for (let i = 0; i <= 4; i++) {
            const value = minValue + (valueRange * i / 4);
            const y = getY(value);
            
            ctx.beginPath();
            ctx.moveTo(padding - 3, y);
            ctx.lineTo(padding, y);
            ctx.stroke();
            
            ctx.fillText(value.toFixed(0), padding - 6, y + 3);
        }
        
        this.charts.boxChart = {
            destroy: () => {
                ctx.clearRect(0, 0, width, height);
            }
        };
    }

    // 创建山脊图（全新优化版本，动态效果）
    createRidgelineChart(colors) {
        const canvas = document.getElementById('ridgelineChart');
        if (!canvas) return;
        
        const container = canvas.parentElement;
        const containerRect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        canvas.width = containerRect.width * dpr;
        canvas.height = 200 * dpr;
        canvas.style.width = containerRect.width + 'px';
        canvas.style.height = '200px';
        
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        
        const width = containerRect.width;
        const height = 220;
        const padding = 50;
        const plotWidth = width - 2 * padding;
        const plotHeight = height - 2 * padding;
        
        // 山脊参数
        const numRidges = colors.length;
        const ridgeHeight = plotHeight / (numRidges + 0.5); // 留出更多空间
        const maxRidgeAmplitude = ridgeHeight * 0.5;
        
        // 生成每个山脊的数据
        const ridgeData = colors.map((color, index) => {
            const points = 80;
            const mean = 30 + Math.random() * 40; // 随机峰值位置
            const std = 8 + Math.random() * 6; // 随机宽度
            const amplitude = maxRidgeAmplitude * (0.7 + Math.random() * 0.3); // 随机高度
            
            const data = [];
            for (let i = 0; i <= points; i++) {
                const x = (i / points) * 100;
                const density = Math.exp(-0.5 * Math.pow((x - mean) / std, 2));
                data.push({
                    x: padding + (i / points) * plotWidth,
                    density: density,
                    amplitude: amplitude
                });
            }
            
            return {
                color,
                data,
                baseY: padding + ridgeHeight * (index + 1),
                label: `分布 ${index + 1}`,
                phase: Math.random() * Math.PI * 2 // 动画相位
            };
        });
        
        let animationTime = 0;
        const animationSpeed = 0.02;
        
        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            
            // 绘制背景网格线（X轴）
            ctx.strokeStyle = 'rgba(0,0,0,0.1)';
            ctx.lineWidth = 1;
            for (let i = 0; i <= 5; i++) {
                const x = padding + (i / 5) * plotWidth;
                ctx.beginPath();
                ctx.moveTo(x, padding);
                ctx.lineTo(x, height - padding);
                ctx.stroke();
            }
            
            // 绘制每个山脊
            ridgeData.forEach((ridge, ridgeIndex) => {
                const waveOffset = Math.sin(animationTime + ridge.phase) * 0.1; // 轻微的波动效果
                
                // 绘制填充区域
                ctx.fillStyle = ridge.color;
                ctx.strokeStyle = ridge.color;
                ctx.lineWidth = 2;
                
                ctx.beginPath();
                
                // 从基线开始
                ctx.moveTo(ridge.data[0].x, ridge.baseY);
                
                // 绘制密度曲线
                ridge.data.forEach((point, pointIndex) => {
                    const dynamicAmplitude = point.amplitude * (1 + waveOffset);
                    const y = ridge.baseY - point.density * dynamicAmplitude;
                    
                    if (pointIndex === 0) {
                        ctx.lineTo(point.x, y);
                    } else {
                        // 使用二次贝塞尔曲线让线条更平滑
                        const prevPoint = ridge.data[pointIndex - 1];
                        const cpX = (prevPoint.x + point.x) / 2;
                        const cpY = (ridge.baseY - prevPoint.density * prevPoint.amplitude * (1 + waveOffset) + y) / 2;
                        ctx.quadraticCurveTo(cpX, cpY, point.x, y);
                    }
                });
                
                // 回到基线完成闭合
                ctx.lineTo(ridge.data[ridge.data.length - 1].x, ridge.baseY);
                ctx.lineTo(ridge.data[0].x, ridge.baseY);
                ctx.closePath();
                
                // 填充
                ctx.globalAlpha = 0.8;
                ctx.fill();
                
                // 描边
                ctx.globalAlpha = 1;
                ctx.beginPath();
                ridge.data.forEach((point, pointIndex) => {
                    const dynamicAmplitude = point.amplitude * (1 + waveOffset);
                    const y = ridge.baseY - point.density * dynamicAmplitude;
                    
                    if (pointIndex === 0) {
                        ctx.moveTo(point.x, y);
                    } else {
                        const prevPoint = ridge.data[pointIndex - 1];
                        const cpX = (prevPoint.x + point.x) / 2;
                        const cpY = (ridge.baseY - prevPoint.density * prevPoint.amplitude * (1 + waveOffset) + y) / 2;
                        ctx.quadraticCurveTo(cpX, cpY, point.x, y);
                    }
                });
                ctx.stroke();
                
                // 绘制基线
                ctx.strokeStyle = 'rgba(0,0,0,0.2)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(padding, ridge.baseY);
                ctx.lineTo(width - padding, ridge.baseY);
                ctx.stroke();
                
                // 绘制标签
                ctx.fillStyle = '#333';
                ctx.font = '11px Arial';
                ctx.textAlign = 'left';
                ctx.fillText(ridge.label, padding - 45, ridge.baseY - ridge.data[0].amplitude / 2);
            });
            
            // 绘制坐标轴
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            
            // X轴
            const xAxisY = height - padding;
            ctx.beginPath();
            ctx.moveTo(padding, xAxisY);
            ctx.lineTo(width - padding, xAxisY);
            ctx.stroke();
            
            // Y轴
            ctx.beginPath();
            ctx.moveTo(padding, padding);
            ctx.lineTo(padding, xAxisY);
            ctx.stroke();
            
            // X轴刻度和标签
            ctx.fillStyle = '#666';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            for (let i = 0; i <= 5; i++) {
                const x = padding + (i / 5) * plotWidth;
                const value = (i / 5) * 100;
                
                // 刻度线
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x, xAxisY);
                ctx.lineTo(x, xAxisY + 4);
                ctx.stroke();
                
                // 标签
                ctx.fillText(value.toFixed(0), x, xAxisY + 16);
            }
            
            // X轴标题
            ctx.fillStyle = '#333';
            ctx.font = '11px Arial';
            ctx.fillText('数值', width / 2, height - 8);
            
            animationTime += animationSpeed;
            
            // 继续动画
            this.animationFrames.ridgelineChart = requestAnimationFrame(animate);
        };
        
        // 开始动画
        animate();
        
        this.charts.ridgelineChart = {
            destroy: () => {
                if (this.animationFrames.ridgelineChart) {
                    cancelAnimationFrame(this.animationFrames.ridgelineChart);
                    delete this.animationFrames.ridgelineChart;
                }
                ctx.clearRect(0, 0, width, height);
            }
        };
    }

    // 创建面积图
    createAreaChart(colors) {
        const ctx = document.getElementById('areaChart');
        if (!ctx) return;
        
        this.charts.areaChart = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
                datasets: colors.map((color, i) => ({
                    label: `Series ${i + 1}`,
                    data: Array(10).fill().map(() => Math.floor(Math.random() * 20) + 10 + i * 5),
                    borderColor: color,
                    backgroundColor: color,
                    fill: i === 0 ? 'origin' : `-${i}`,
                    tension: 0.4,
                    borderWidth: 0,
                    pointRadius: 0
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: { 
                    legend: { position: 'top', labels: { usePointStyle: true, padding: 15 } },
                    tooltip: { mode: 'index', intersect: false }
                },
                scales: { 
                    y: { beginAtZero: true, stacked: true, grid: { color: 'rgba(0,0,0,0.1)' } },
                    x: { grid: { color: 'rgba(0,0,0,0.1)' } }
                }
            }
        });
    }

    // 创建密度图
    createDensityChart(colors) {
        const ctx = document.getElementById('densityChart');
        if (!ctx) return;
        
        this.charts.densityChart = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: Array(100).fill().map((_, i) => i),
                datasets: colors.map((color, i) => {
                    const mean = 50 + i * 15;
                    const std = 12 + i * 2;
                    const data = Array(100).fill().map((_, x) => {
                        const density = Math.exp(-0.5 * Math.pow((x - mean) / std, 2)) / (std * Math.sqrt(2 * Math.PI));
                        return density * 100;
                    });
                    
                    return {
                        label: `Distribution ${i + 1}`,
                        data: data,
                        borderColor: color,
                        backgroundColor: color,
                        fill: 'origin',
                        tension: 0.4,
                        borderWidth: 0,
                        pointRadius: 0
                    };
                })
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top', labels: { usePointStyle: true, padding: 15 } } },
                scales: { 
                    y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.1)' } },
                    x: { grid: { color: 'rgba(0,0,0,0.1)' } }
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
