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
    const firstName = name.trim().split(' ')[0]; // Extract first name only
    
    // Build review paragraph
    let review = `Throughout this performance period, ${firstName} has demonstrated `;
    
    if (analysis.strengths.length > analysis.improvements.length) {
        review += `truly exceptional performance that consistently exceeds organizational expectations and sets a high standard for ${possessive} peers. `;
    } else if (analysis.strengths.length === analysis.improvements.length) {
        review += `commendable performance with a well-balanced profile of notable achievements alongside meaningful opportunities for continued professional growth and development. `;
    } else {
        review += `performance that reflects genuine potential and dedication, with several key areas identified for focused development that will enhance ${possessive} overall contribution to the team. `;
    }
    
    // Highlight key strengths and major wins
    if (analysis.strengths.length > 0) {
        review += `${subjective.charAt(0).toUpperCase() + subjective.slice(1)} has demonstrated remarkable excellence across multiple performance dimensions. Notably, ${subjective} has achieved outstanding results in `;
        
        const topStrengths = analysis.strengths.slice(0, 3).map(s => {
            const metricName = s.split(':')[0].toLowerCase();
            return metricName;
        });
        
        if (topStrengths.length === 1) {
            review += `${topStrengths[0]}, which represents a significant accomplishment. `;
        } else if (topStrengths.length === 2) {
            review += `${topStrengths[0]} and ${topStrengths[1]}, both of which showcase ${possessive} commitment to excellence. `;
        } else {
            review += `${topStrengths.slice(0, -1).join(', ')}, and ${topStrengths[topStrengths.length - 1]}, all of which represent major wins for both ${objective} and the organization. `;
        }
        
        if (analysis.strengths.length > 3) {
            review += `Beyond these standout achievements, ${subjective} has also maintained strong performance across ${analysis.strengths.length - 3} additional metrics, demonstrating ${possessive} comprehensive approach to excellence. `;
        }
    }
    
    // Custom highlights section
    if (customHighlights && customHighlights.trim()) {
        review += `In addition to ${possessive} measured performance metrics, ${firstName} has gone above and beyond expectations in several noteworthy ways. ${customHighlights.trim()} These contributions exemplify ${possessive} dedication and proactive approach to making a meaningful impact. `;
    }
    
    // Address reliability
    const reliabilityIssues = Object.entries(metrics.reliability).filter(([key, value]) => {
        return TARGETS.reliability[key].value !== value;
    });
    
    if (reliabilityIssues.length === 0) {
        review += `From a reliability and compliance perspective, ${firstName} has maintained impeccable standards throughout the review period, demonstrating zero safety infractions, compliance violations, or security incidents. This exemplary track record reflects ${possessive} strong commitment to organizational policies and best practices, establishing ${objective} as a trusted and dependable team member. `;
    } else {
        review += `Regarding reliability standards, there are some areas requiring focused attention and improvement, specifically related to `;
        review += reliabilityIssues.map(([key]) => TARGETS.reliability[key].label.toLowerCase()).join(', ');
        review += `. Addressing these concerns will be important for ${possessive} continued professional development and alignment with organizational expectations. `;
    }
    
    // Areas for improvement
    if (analysis.improvements.length > 0) {
        review += `As ${firstName} continues ${possessive} professional journey, there are valuable opportunities for growth and development that will further enhance ${possessive} already strong contributions. Specifically, focusing enhanced attention on `;
        
        const topImprovements = analysis.improvements.slice(0, 3).map(s => {
            const metricName = s.split(':')[0].toLowerCase();
            return metricName;
        });
        
        if (topImprovements.length === 1) {
            review += `${possessive} ${topImprovements[0]} will position ${objective} for even greater success. `;
        } else if (topImprovements.length === 2) {
            review += `${possessive} ${topImprovements[0]} and ${topImprovements[1]} will yield significant benefits for both ${possessive} personal development and team performance. `;
        } else {
            review += `${possessive} ${topImprovements.slice(0, -1).join(', ')}, and ${topImprovements[topImprovements.length - 1]} will create meaningful advancement in ${possessive} overall performance profile. `;
        }
        
        review += `With targeted effort and the appropriate support and resources, these development areas represent exciting opportunities for ${firstName} to elevate ${possessive} performance to new heights. `;
    }
    
    // Closing statement
    if (analysis.strengths.length > analysis.improvements.length) {
        review += `Looking ahead to the coming year, ${firstName} is exceptionally well-positioned to continue ${possessive} trajectory of outstanding performance, serve as an inspirational role model for colleagues, and take on expanded responsibilities that leverage ${possessive} proven strengths. The organization values ${possessive} contributions and looks forward to ${possessive} continued success and leadership.`;
    } else if (analysis.improvements.length > analysis.strengths.length) {
        review += `As we look to the future, ${firstName} has a clear pathway for professional growth that, when combined with ${possessive} existing capabilities and evident dedication, will enable ${objective} to significantly enhance ${possessive} overall performance and make even stronger contributions to team success. With commitment to these development priorities, ${subjective} has tremendous potential for advancement.`;
    } else {
        review += `Moving forward into the next performance period, ${firstName} is strongly encouraged to build strategically upon ${possessive} demonstrated strengths while simultaneously addressing identified development areas. This balanced approach will position ${objective} to achieve even greater success, expand ${possessive} impact, and advance ${possessive} professional growth within the organization.`;
    }
    
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
