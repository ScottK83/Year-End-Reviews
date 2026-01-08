# Year-End Review Generator

A web-based application for generating employee year-end reviews based on performance metrics.

## Features

- **Employee Information**: Input employee name and pronouns
- **Comprehensive Metrics Tracking**:
  - Reliability Metrics (safety, compliance, security)
  - Driver & Sub-driver Metrics (performance KPIs)
- **Automated Analysis**: Compares actual performance against targets
- **AI-Generated Reviews**: Creates professional review paragraphs
- **Export Options**: 
  - Copy to clipboard
  - Export to Word document

## Metrics Tracked

### Reliability Metrics
- Emergency Safety Hazard Infractions (Target: 0)
- Unsubstantiated ACC Complaints (Target: 0)
- Phishing Email Clicks (Target: 0)
- Red Flag Events (Target: 0)
- Deposit Waiver Accuracy (Target: 100%)

### Driver & Sub-driver Metrics
- Schedule Adherence (Target: ≥93%)
- CX Rep Overall (Target: ≥80%)
- First Call Resolution (Target: ≥70%)
- Transfers (Target: <6%)
- Overall Sentiment (Target: ≥88%)
- Positive Word Choice (Target: ≥86%)
- Negative Word (Target: ≥83%)
- Managing Emotions (Target: ≥95%)
- Average Handle Time (Target: <440s)
- ACE (Target: <60s)
- Hold Time (Target: <30s)
- Reliability Hours (Target: <16hrs)

## How to Use

1. Open `index.html` in your web browser
2. Fill in employee information (name and pronouns)
3. Enter actual performance metrics for all fields
4. Click "Generate Review"
5. Review the performance summary and generated paragraph
6. Export to Word or copy to clipboard as needed

## Technologies Used

- HTML5
- CSS3
- JavaScript (Vanilla)
- docx.js (for Word document generation)

## File Structure

```
Year End Reviews/
├── index.html       # Main application interface
├── styles.css       # Application styling
├── script.js        # Application logic and review generation
└── README.md        # This file
```

## Installation

No installation required! Simply open `index.html` in any modern web browser.

## Browser Compatibility

Works with all modern browsers:
- Chrome
- Firefox
- Safari
- Edge

## Future Enhancements

- Save/load review data
- Multiple employee batch processing
- Historical review tracking
- Custom metric configurations
- PDF export option

---

Created with ❤️ for streamlined year-end review processes
