function convertTextToNumbers(text){
    const szavak = {
        'egy': 1, 'kettő': 2, 'két': 2, 'három': 3, 'négy': 4, 'öt': 5,
        'hat': 6, 'hét': 7, 'nyolc': 8, 'kilenc': 9, 'tíz': 10,
        'tizenegy': 11, 'tizenkettő': 12, 'tizenhárom': 13, 'tizennégy': 14,
        'tizenöt': 15, 'tizenhat': 16, 'tizenhét': 17, 'tizennyolc': 18, 'tizenkilenc': 19,
        'húsz': 20, 'harminc': 30, 'negyven': 40, 'ötven': 50, 'hatvan': 60,
        'hetven': 70, 'nyolcvan': 80, 'kilencven': 90, 'száz': 100, 'ezer': 1000
    };

    text = text.toLowerCase().replace(/\s+/g, '');
    let sum = 0;

    if (text.includes('ezer')) {
        const parts = text.split('ezer');
        const ezres = convertTextToNumber(parts[0]);
        const maradek = convertTextToNumber(parts[1] || '');
        return ezres * 1000 + maradek;
    }

    for (const key in szavak) {
        if (text.startsWith(key)) {
            sum += szavak[key];
            text = text.slice(key.length);
            return sum + convertTextToNumber(text);
        }
    }

    return sum;
}