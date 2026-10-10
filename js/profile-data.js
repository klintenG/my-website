/* Public professional facts used by optional portfolio demos.
   Keep private recruiting and family details out of browser-delivered source. */
const PROFILE_DATA = {
    personalInfo: {
        fullName: 'Bill Klinten Guduru', preferredName: 'Klinten',
        location: 'Bengaluru, Karnataka, India', email: 'klintenguduru@gmail.com',
        linkedin: 'linkedin.com/in/bill-klinten-guduru-2b361a229',
        github: 'github.com/klintenG', website: 'klinteng.com',
    },
    professionalSummary: 'Software engineer with 6+ years of enterprise product work at Infosys and EdgeVerve. Since 2024, focused on AI applications and developer tools alongside full-stack engineering.',
    workExperience: [
        { title: 'Member — UI Development', company: 'EdgeVerve Systems Limited (Infosys subsidiary)', duration: '2024 — Present', location: 'Bengaluru, India', responsibilities: [
            'Worked on AI-assisted documentation, incident diagnosis, and banking interface initiatives.',
            'Continued enterprise UI development and API integration for Finacle products.',
        ], techStack: ['React', 'TypeScript', 'AI Canvas', 'Playwright'] },
        { title: 'Product Engineer', company: 'EdgeVerve Systems Limited', duration: '2022 — 2024', location: 'Bengaluru, India', responsibilities: [
            'Built banking product interfaces and integrated backend APIs.',
            'Worked on legacy component migration and product delivery.',
        ], techStack: ['Spring Boot', 'Polymer.js', 'WaveMaker', 'Node.js'] },
        { title: 'Senior Systems Engineer', company: 'Infosys Limited', duration: '2021 — 2022', location: 'India', responsibilities: ['Developed enterprise application features and supported team delivery.'], techStack: ['Java', 'Spring Boot', 'JavaScript', 'Angular'] },
        { title: 'Systems Engineer', company: 'Infosys Limited', duration: 'Dec 2019 — 2021', location: 'India', responsibilities: ['Worked on full-stack enterprise applications.'], techStack: ['Java', 'Spring Boot', 'HTML/CSS', 'JavaScript'] },
    ],
    technicalSkills: {
        aiAgentEngineering: 'LLM integration, retrieval, tool calling, structured outputs, developer automation',
        productionProven: 'React, TypeScript, Java, Spring Boot, Node.js, REST APIs',
        strongKnowledge: 'Angular, Python, Docker, AWS, Git',
    },
    enterpriseProjects: [
        { name: 'Finacle banking interfaces', description: 'Worked on cash management, expenses, and payment interfaces at EdgeVerve.', role: 'UI development and API integration.', tech: ['React', 'Angular', 'Spring Boot'] },
    ],
    aiProjects: [
        { name: 'Project HER', description: 'Personal article and topic to video project deployed on Cloud Run.', tech: ['Gemini', 'FastAPI', 'Remotion'], context: 'Personal project', status: 'External demo' },
        { name: 'DocViz AI', description: 'Hackathon project exploring retrieval and document to video explanation. A four-agent pipeline is followed by a separate validation step.', tech: ['Claude', 'PGVector', 'React', 'TypeScript'], context: 'Hackathon', status: 'Prototype' },
        { name: '5-Minute RCA Tool', description: 'Internal tool combining error playbooks and code search to support incident investigation.', tech: ['Python', 'GitHub Search API', 'React'], context: 'Internal tool', status: 'Internal' },
        { name: 'Doc Portal Reviewer', description: 'Internal documentation review automation using Playwright and LLM evaluation.', tech: ['Python', 'Playwright'], context: 'Internal tool', status: 'Internal' },
    ],
    education: {
        degree: 'Bachelor of Technology (B.Tech)', field: 'Electrical and Electronics Engineering',
        university: 'Sri Krishnadevaraya University', duration: 'June 2015 — April 2019',
    },
};

function buildProfileContext() {
    const p = PROFILE_DATA;
    return [
        `Name: ${p.personalInfo.fullName} (prefers Klinten)`,
        `Location: ${p.personalInfo.location}`,
        `Contact: ${p.personalInfo.email}`,
        `Summary: ${p.professionalSummary}`,
        'Experience:',
        ...p.workExperience.map(role => `${role.title}, ${role.company}, ${role.duration}. ${role.responsibilities.join(' ')}`),
        'Skills:', ...Object.values(p.technicalSkills),
        'Projects:',
        ...p.aiProjects.map(project => `${project.name} (${project.context}, ${project.status}): ${project.description}`),
        ...p.enterpriseProjects.map(project => `${project.name}: ${project.description}`),
        `Education: ${p.education.degree} in ${p.education.field}, ${p.education.university}, ${p.education.duration}`,
    ].join('\n');
}
