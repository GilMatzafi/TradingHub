// Shared chart utilities and configurations

export const chartColors = {
    profit: {
        positive: {
            background: 'rgba(0, 200, 83, 0.6)',
            border: 'rgba(0, 200, 83, 1)'
        },
        negative: {
            background: 'rgba(211, 47, 47, 0.6)',
            border: 'rgba(211, 47, 47, 1)'
        }
    },
    volume: {
        background: 'rgba(255, 206, 86, 0.2)',
        border: 'rgba(255, 206, 86, 1)'
    }
};

export const defaultChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
        intersect: false,
        mode: 'index'
    }
};

export function formatCurrency(value) {
    return value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

export function formatPercentage(value) {
    return `${(value * 100).toFixed(2)}%`;
}

export function formatTime(hour) {
    return `${hour.toString().padStart(2, '0')}:00`;
}

export function destroyChart(chart) {
    if (chart instanceof Chart) {
        chart.destroy();
        return null;
    }
    return chart;
} 