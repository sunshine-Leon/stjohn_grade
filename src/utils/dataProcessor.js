import Papa from 'papaparse';
import _ from 'lodash';

export const processCSVData = (csvText) => {
    const result = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
    });

    if (result.errors.length > 0) {
        console.error("CSV Parsing errors:", result.errors);
    }
    console.log("Raw parsed headers:", result.meta.fields);
    console.log("First row data:", result.data[0]);

    const rawData = result.data.map(row => ({
        ...row,
        Midterm: parseFloat(row.Midterm) || 0,
        'Assignment 1': parseFloat(row['Assignment 1']) || 0,
        'Assignment 2': row['Assignment 2'] === 'N/A' ? 0 : (parseFloat(row['Assignment 2']) || 0),
        Presentation: parseFloat(row.Presentation) || 0,
        TOTAL: parseFloat(row.TOTAL) || 0,
        isGamuda: row.GAMUDA === 'Y' || row.GAMUDA === 'y' || row.GAMUDA === 'V' || row.GAMUDA === 'v'
    }));

    const categories = ['Midterm', 'Assignment 1', 'Assignment 2', 'Presentation', 'TOTAL'];

    const calculateStats = (data) => {
        const stats = {};
        categories.forEach(cat => {
            const values = data.length > 0 ? data.map(d => d[cat]) : [];
            const mean = values.length > 0 ? _.mean(values) : 0;
            const median = values.length > 0 ? _.sortBy(values)[Math.floor(values.length / 2)] : 0;
            const max = values.length > 0 ? _.max(values) : 0;
            const min = values.length > 0 ? _.min(values) : 0;
            const sd = values.length > 0 ? Math.sqrt(_.sum(values.map(v => Math.pow(v - (mean || 0), 2))) / values.length) : 0;

            stats[cat] = {
                mean: parseFloat((mean || 0).toFixed(2)),
                median: parseFloat((median || 0).toFixed(2)),
                max: parseFloat((max || 0).toFixed(2)),
                min: parseFloat((min || 0).toFixed(2)),
                sd: parseFloat((sd || 0).toFixed(2)),
                data: values
            };
        });
        return stats;
    };

    const overallStats = calculateStats(rawData);
    const gamudaData = rawData.filter(d => d.isGamuda);
    const nonGamudaData = rawData.filter(d => !d.isGamuda);

    const gamudaStats = calculateStats(gamudaData);
    const nonGamudaStats = calculateStats(nonGamudaData);

    return {
        rawData,
        overallStats,
        gamudaStats,
        nonGamudaStats,
        counts: {
            total: rawData.length,
            gamuda: gamudaData.length,
            nonGamuda: nonGamudaData.length
        }
    };
};
