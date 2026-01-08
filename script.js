// Target metrics configuration
const TARGETS = {
    reliability: {
        safetyHazards: { value: 0, type: 'exact', label: 'Emergency Safety Hazard Infractions' },
        accComplaints: { value: 0, type: 'exact', label: 'Substantiated ACC Complaints' },
        phishingClicks: { value: 0, type: 'exact', label: 'Phishing Email Clicks' },
        redFlags: { value: 0, type: 'exact', label: 'Red Flag Events' },
        depositWaiver: { value: 0, type: 'exact', label: 'Deposit Waiver Accuracy Infractions' }
    },
    drivers: {
        scheduleAdherence: { value: 93, type: 'min', label: 'Schedule Adherence' },
        cxRepOverall: { value: 80, type: 'min', label: 'CX Rep Overall' },
        fcr: { value: 70, type: 'min', label: 'First Call Resolution' },
        transfers: { value: 6, type: 'max', label: 'Transfers' },
        overallSentiment: { value: 88, type: 'min', label: 'Overall Sentiment' },
        positiveWord: { value: 86, type: 'min', label: 'Positive Word Choice' },
        negativeWord: { value: 83, type: 'min', label: 'Negative Word' },
        managingEmotions: { value: 95, type: 'min', label: 'Managing Emotions' },
        aht: { value: 440, type: 'max', label: 'Average Handle Time' },
        acw: { value: 60, type: 'max', label: 'ACW' },
        holdTime: { value: 30, type: 'max', label: 'Hold Time' },
        reliability: { value: 16, type: 'max', label: 'Reliability Hours' }
    }
};

let currentMetrics = {};

// Form submission handler
document.getElementById('reviewForm').addEventListener('submit', function(e) {
    e.preventDefault();
    generateReview();
});

// Reset form handler
document.getElementById('reviewForm').addEventListener('reset', function() {
    document.getElementById('resultsSection').style.display = 'none';
});

// Export to Word handler
document.getElementById('exportWord').addEventListener('click', exportToWord);

// Copy to clipboard handler
document.getElementById('copyReview').addEventListener('click', copyToClipboard);

// New review handler
document.getElementById('newReview').addEventListener('click', function() {
    document.getElementById('reviewForm').reset();
    document.getElementById('resultsSection').style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

function generateReview() {
    // Collect employee information
    const employeeName = document.getElementById('employeeName').value;
    const pronouns = document.getElementById('pronouns').value;
    const customHighlights = document.getElementById('customHighlights').value;
    
    // Collect all metrics
    currentMetrics = {
        name: employeeName,
        pronouns: pronouns,
        customHighlights: customHighlights,
        reliability: {
            safetyHazards: parseFloat(document.getElementById('safetyHazards').value),
            accComplaints: parseFloat(document.getElementById('accComplaints').value),
            phishingClicks: parseFloat(document.getElementById('phishingClicks').value),
            redFlags: parseFloat(document.getElementById('redFlags').value),
            depositWaiver: parseFloat(document.getElementById('depositWaiver').value)
        },
        drivers: {
            scheduleAdherence: parseFloat(document.getElementById('scheduleAdherence').value),
            cxRepOverall: parseFloat(document.getElementById('cxRepOverall').value),
            fcr: parseFloat(document.getElementById('fcr').value),
            transfers: parseFloat(document.getElementById('transfers').value),
            overallSentiment: parseFloat(document.getElementById('overallSentiment').value),
            positiveWord: parseFloat(document.getElementById('positiveWord').value),
            negativeWord: parseFloat(document.getElementById('negativeWord').value),
            managingEmotions: parseFloat(document.getElementById('managingEmotions').value),
            aht: parseFloat(document.getElementById('aht').value),
            acw: parseFloat(document.getElementById('acw').value),
            holdTime: parseFloat(document.getElementById('holdTime').value),
            reliability: parseFloat(document.getElementById('reliability').value)
        }
    };
    
    // Analyze metrics
    const analysis = analyzeMetrics(currentMetrics);
    
    // Display results
    displayResults(analysis);
    
    // Generate AI review paragraph
    const reviewParagraph = generateAIReview(currentMetrics, analysis);
    document.getElementById('reviewText').textContent = reviewParagraph;
    
    // Show results section
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
}

function analyzeMetrics(metrics) {
    const analysis = {
        strengths: [],
        improvements: [],
        neutral: []
    };
    
    // Analyze reliability metrics
    for (const [key, value] of Object.entries(metrics.reliability)) {
        const target = TARGETS.reliability[key];
        const actual = value;
        
        if (target.type === 'exact') {
            if (actual === target.value) {
                analysis.strengths.push(`${target.label}: ${actual}${key === 'depositWaiver' ? '%' : ''} (Target: ${target.value}${key === 'depositWaiver' ? '%' : ''})`);
            } else {
                analysis.improvements.push(`${target.label}: ${actual}${key === 'depositWaiver' ? '%' : ''} (Target: ${target.value}${key === 'depositWaiver' ? '%' : ''})`);
            }
        }
    }
    
    // Analyze driver metrics
    for (const [key, value] of Object.entries(metrics.drivers)) {
        const target = TARGETS.drivers[key];
        const actual = value;
        let unit = '';
        
        if (['scheduleAdherence', 'cxRepOverall', 'fcr', 'transfers', 'overallSentiment', 'positiveWord', 'negativeWord', 'managingEmotions'].includes(key)) {
            unit = '%';
        } else if (['aht', 'acw', 'holdTime'].includes(key)) {
            unit = 's';
        } else if (key === 'reliability') {
            unit = 'hrs';
        }
        
        if (target.type === 'min') {
            if (actual >= target.value) {
                analysis.strengths.push(`${target.label}: ${actual}${unit} (Target: ≥${target.value}${unit})`);
            } else if (actual >= target.value * 0.95) {
                analysis.neutral.push(`${target.label}: ${actual}${unit} (Target: ≥${target.value}${unit})`);
            } else {
                analysis.improvements.push(`${target.label}: ${actual}${unit} (Target: ≥${target.value}${unit})`);
            }
        } else if (target.type === 'max') {
            if (actual <= target.value) {
                analysis.strengths.push(`${target.label}: ${actual}${unit} (Target: ≤${target.value}${unit})`);
            } else if (actual <= target.value * 1.05) {
                analysis.neutral.push(`${target.label}: ${actual}${unit} (Target: ≤${target.value}${unit})`);
            } else {
                analysis.improvements.push(`${target.label}: ${actual}${unit} (Target: ≤${target.value}${unit})`);
            }
        }
    }
    
    return analysis;
}

function displayResults(analysis) {
    const strengthsList = document.getElementById('strengthsList');
    const improvementsList = document.getElementById('improvementsList');
    
    // Display strengths
    let strengthsHTML = '<h4>Strengths:</h4><ul>';
    if (analysis.strengths.length > 0) {
        analysis.strengths.forEach(item => {
            strengthsHTML += `<li class="strength">✓ ${item}</li>`;
        });
    } else {
        strengthsHTML += '<li>No metrics exceeded targets</li>';
    }
    strengthsHTML += '</ul>';
    strengthsList.innerHTML = strengthsHTML;
    
    // Display areas for improvement
    let improvementsHTML = '<h4>Areas for Improvement:</h4><ul>';
    if (analysis.improvements.length > 0) {
        analysis.improvements.forEach(item => {
            improvementsHTML += `<li class="improvement">✗ ${item}</li>`;
        });
    } else {
        improvementsHTML += '<li class="strength">All metrics met or exceeded targets!</li>';
    }
    if (analysis.neutral.length > 0) {
        improvementsHTML += '<h4 style="margin-top: 15px;">Near Target (Within 5%):</h4>';
        analysis.neutral.forEach(item => {
            improvementsHTML += `<li class="neutral">◆ ${item}</li>`;
        });
    }
    improvementsHTML += '</ul>';
    improvementsList.innerHTML = improvementsHTML;
}

function generateAIReview(metrics, analysis) {
    const { name, pronouns, customHighlights } = metrics;
    const [subjective, objective, possessive] = getPronounForms(pronouns);
    const firstName = name.trim().split(' ')[0];
    
    const perfRatio = analysis.strengths.length / (analysis.strengths.length + analysis.improvements.length || 1);
    
    // Varied opening statements
    const openings = {
        exceptional: [
            `Throughout this review period, ${firstName} has demonstrated truly outstanding performance that consistently surpasses expectations and elevates team standards. `,
            `${firstName}'s performance over the past year has been nothing short of exceptional, with consistent excellence across multiple critical dimensions. `,
            `This year, ${firstName} has set themselves apart through consistently exceptional performance and unwavering commitment to organizational goals. `,
        ],
        strong: [
            `${firstName} has delivered solid performance throughout this review period, with meaningful accomplishments balanced by opportunities for continued growth. `,
            `This past year reflects ${firstName}'s capable approach to ${possessive} role, with notable strengths alongside areas for development. `,
            `${firstName} has shown competent and reliable performance, demonstrating both substantive contributions and potential for expanded impact. `,
        ],
        developing: [
            `During this review period, ${firstName} has shown genuine effort and dedication, with clear potential for growth in key performance areas. `,
            `${firstName}'s performance reflects a developing professional with meaningful contributions and important opportunities for skill enhancement. `,
            `This year has presented valuable learning opportunities for ${firstName}, with several areas identified for focused professional development. `,
        ]
    };
    
    let category = perfRatio > 0.6 ? 'exceptional' : perfRatio > 0.35 ? 'strong' : 'developing';
    let review = openings[category][Math.floor(Math.random() * openings[category].length)];
    
    // Varied strength sections
    if (analysis.strengths.length > 0) {
        const strengthVariations = [
            `${subjective.charAt(0).toUpperCase() + subjective.slice(1)} has demonstrated remarkable proficiency in ${analysis.strengths.length > 1 ? 'several key areas' : 'a critical performance area'}, `,
            `Notable achievements include demonstrated excellence in ${analysis.strengths.length > 1 ? 'multiple dimensions' : 'a key performance indicator'}, specifically `,
            `${firstName}'s most impressive contributions are evident in ${analysis.strengths.length > 1 ? 'the breadth of strong performance across' : ''} `,
        ];
        
        review += strengthVariations[Math.floor(Math.random() * strengthVariations.length)];
        
        const topStrengths = analysis.strengths.slice(0, 3).map(s => s.split(':')[0].toLowerCase());
        
        if (topStrengths.length === 1) {
            review += `${topStrengths[0]}, which represents significant professional achievement. `;
        } else if (topStrengths.length === 2) {
            review += `${topStrengths[0]} and ${topStrengths[1]}, demonstrating sustained excellence. `;
        } else {
            review += `${topStrengths.slice(0, -1).join(', ')}, and ${topStrengths[topStrengths.length - 1]}, reflecting comprehensive professional competence. `;
        }
    }
    
    // Custom highlights - varied
    if (customHighlights && customHighlights.trim()) {
        const highlightVariations = [
            `Beyond measured metrics, ${firstName} has distinguished ${objective} through proactive contributions: ${customHighlights.trim()} `,
            `In addition to quantified performance, ${firstName} has demonstrated initiative and impact by: ${customHighlights.trim()} `,
            `${firstName} deserves recognition for going above baseline expectations in the following ways: ${customHighlights.trim()} `,
        ];
        review += highlightVariations[Math.floor(Math.random() * highlightVariations.length)];
    }
    
    // Reliability - varied
    const reliabilityIssues = Object.entries(metrics.reliability).filter(([key, value]) => {
        return TARGETS.reliability[key].value !== value;
    });
    
    if (reliabilityIssues.length === 0) {
        const reliabilityPhrases = [
            `From a compliance and reliability standpoint, ${firstName} has maintained an exemplary record with zero infractions across all critical safety and security measures, reflecting consistent adherence to organizational standards. `,
            `${firstName} has demonstrated impeccable compliance throughout the review period, with a flawless reliability record that establishes ${objective} as a dependable contributor to organizational safety and security. `,
            `Notably, ${firstName}'s reliability profile is spotless, with no safety infractions, compliance violations, or security concerns—a testament to ${possessive} professional integrity. `,
        ];
        review += reliabilityPhrases[Math.floor(Math.random() * reliabilityPhrases.length)];
    } else {
        review += `Regarding compliance and reliability standards, there are important areas requiring focused improvement. Specifically, ${reliabilityIssues.map(([key]) => TARGETS.reliability[key].label.toLowerCase()).join(', ')} require enhanced attention and corrective action to align with organizational expectations. `;
    }
    
    // Improvements - varied
    if (analysis.improvements.length > 0) {
        const improvementOpeners = [
            `To further enhance ${possessive} professional impact, ${firstName} should prioritize development in the following areas: `,
            `${firstName} has clear opportunities for professional advancement by focusing concentrated effort on: `,
            `Strategic areas for skill development and performance enhancement include: `,
        ];
        review += improvementOpeners[Math.floor(Math.random() * improvementOpeners.length)];
        
        const topImprovements = analysis.improvements.slice(0, 3).map(s => s.split(':')[0].toLowerCase());
        if (topImprovements.length === 1) {
            review += `${topImprovements[0]}. `;
        } else if (topImprovements.length === 2) {
            review += `${topImprovements[0]} and ${topImprovements[1]}. `;
        } else {
            review += `${topImprovements.slice(0, -1).join(', ')}, and ${topImprovements[topImprovements.length - 1]}. `;
        }
    }
    
    // Dynamic closing
    const closingStatements = {
        exceptional: [
            `${firstName} is uniquely positioned to assume expanded responsibilities and continue elevating organizational performance. Leadership looks forward to ${possessive} sustained excellence and the positive influence ${subjective} exerts on team dynamics and culture.`,
            `As we look forward, ${firstName} represents a valuable asset to the organization whose trajectory of achievement positions ${objective} as both a solid performer and a potential leader. We anticipate continued strong contributions.`,
            `${firstName}'s demonstrated capabilities and commitment position ${objective} well for increased responsibility and continued professional advancement. The organization values the contributions ${subjective} brings to the team.`,
        ],
        strong: [
            `Moving ahead, ${firstName} should build on demonstrated strengths while addressing identified development areas. This balanced approach will yield meaningful professional growth and enhanced organizational impact.`,
            `With attention to the development opportunities outlined, ${firstName} has solid potential for progression and expanded contribution. Continued engagement and learning will be key to future success.`,
            `The coming period offers ${firstName} meaningful opportunities to consolidate strengths and address growth areas. With focused effort, ${subjective} can achieve new levels of professional effectiveness.`,
        ],
        developing: [
            `${firstName}'s success in the coming year will depend on dedicated focus to the development priorities identified. With appropriate support and commitment, there is genuine potential for significant performance improvement.`,
            `The path forward for ${firstName} centers on prioritizing the development areas outlined and leveraging inherent strengths. Engagement with coaching and feedback will be essential for advancement.`,
            `${firstName} has the opportunity to substantially enhance ${possessive} professional profile by concentrating effort on identified development priorities. Growth in these areas will unlock expanded career possibilities.`,
        ]
    };
    
    review += closingStatements[category][Math.floor(Math.random() * closingStatements[category].length)];
    
    return review;
}

function getPronounForms(pronouns) {
    switch(pronouns) {
        case 'he/him':
            return ['he', 'him', 'his'];
        case 'she/her':
            return ['she', 'her', 'her'];
        case 'they/them':
            return ['they', 'them', 'their'];
        default:
            return ['they', 'them', 'their'];
    }
}

function exportToWord() {
    const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = docx;
    
    const reviewText = document.getElementById('reviewText').textContent;
    const strengthsList = Array.from(document.querySelectorAll('#strengthsList li')).map(li => li.textContent);
    const improvementsList = Array.from(document.querySelectorAll('#improvementsList li')).map(li => li.textContent);
    
    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                new Paragraph({
                    text: `Year-End Review: ${currentMetrics.name}`,
                    heading: HeadingLevel.HEADING_1,
                    alignment: AlignmentType.CENTER,
                }),
                new Paragraph({ text: '' }),
                new Paragraph({
                    text: 'Performance Summary',
                    heading: HeadingLevel.HEADING_2,
                }),
                new Paragraph({ text: '' }),
                new Paragraph({
                    text: 'Strengths:',
                    heading: HeadingLevel.HEADING_3,
                }),
                ...strengthsList.map(item => new Paragraph({
                    children: [new TextRun({ text: `  • ${item}` })],
                })),
                new Paragraph({ text: '' }),
                new Paragraph({
                    text: 'Areas for Improvement:',
                    heading: HeadingLevel.HEADING_3,
                }),
                ...improvementsList.map(item => new Paragraph({
                    children: [new TextRun({ text: `  • ${item}` })],
                })),
                new Paragraph({ text: '' }),
                new Paragraph({
                    text: 'Year-End Review:',
                    heading: HeadingLevel.HEADING_2,
                }),
                new Paragraph({ text: '' }),
                new Paragraph({
                    children: [new TextRun({ text: reviewText })],
                    spacing: { line: 360 },
                }),
            ],
        }],
    });
    
    Packer.toBlob(doc).then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentMetrics.name.replace(/\s+/g, '_')}_Year_End_Review.docx`;
        a.click();
        URL.revokeObjectURL(url);
    });
}

function copyToClipboard() {
    const reviewText = document.getElementById('reviewText').textContent;
    navigator.clipboard.writeText(reviewText).then(() => {
        const btn = document.getElementById('copyReview');
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    });
}
