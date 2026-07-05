/* ============================================================================
   KLINTEN GUDURU — PROFESSIONAL PROFILE DATA
   ============================================================================
   
   This file contains ALL professional information that the AI assistant
   uses to answer recruiter questions. Edit this file anytime to update 
   your details — the chatbot will automatically use the latest data.

   HOW TO EDIT:
   - Fill in your answers next to each question (replace the placeholder text)
   - Keep answers inside the backtick strings (` `)
   - You can add new sections at the bottom following the same format
   - After editing, just push to GitHub — changes go live automatically

   ============================================================================ */

const PROFILE_DATA = {

    // =========================================================================
    // SECTION 1: PERSONAL INFORMATION
    // =========================================================================
    personalInfo: {
        fullName: 'Bill Klinten Guduru',
        preferredName: 'Klinten',
        dateOfBirth: '30 January 1998',
        birthPlace: 'Gudur, Nellore District, Andhra Pradesh, India',
        location: 'Bengaluru, Karnataka, India',
        email: 'klintenguduru@gmail.com',
        phone: '+91 824 731 5182',
        linkedin: 'linkedin.com/in/bill-klinten-guduru-2b361a229',
        github: 'github.com/klintenG',
        website: 'klinteng.com',
        siblings: 'Two older sisters — Chandrika and Chandana',
    },

    // =========================================================================
    // SECTION 2: PROFESSIONAL SUMMARY
    // =========================================================================
    professionalSummary: `Software engineer who designs AI decision layers inside production enterprise systems. 6+ years shipping full-stack applications at Infosys/EdgeVerve — specializing in embedding LLM-powered reasoning, dynamic localization, and adaptive UI into banking products used by real clients. My approach: AI as an intelligent middleware layer between existing systems, not a replacement for them.`,

    // =========================================================================
    // SECTION 3: WORK EXPERIENCE
    // =========================================================================
    workExperience: [
        {
            title: 'Member — UI Development',
            company: 'EdgeVerve Systems Limited (a subsidiary of Infosys)',
            duration: '2024 — Present',
            location: 'Bengaluru, India',
            isCurrent: true,
            responsibilities: [
                'Leading UI development initiatives for enterprise-grade applications',
                'Architecting front-end solutions using modern JavaScript frameworks',
                'Integrating AI-driven features into existing product platforms',
                'Mentoring junior developers and driving best practices',
            ],
            techStack: ['React', 'Angular', 'Node.js', 'WaveMaker', 'AI Agents'],
        },
        {
            title: 'Product Engineer',
            company: 'EdgeVerve Systems Limited',
            duration: '2022 — 2024',
            location: 'Bengaluru, India',
            isCurrent: false,
            responsibilities: [
                'Developed enterprise product features for banking solutions',
                'Built scalable UI components using Polymer.js and WaveMaker',
                'Collaborated with cross-functional teams for product delivery',
                'Implemented RESTful APIs using Spring Boot and Node.js',
            ],
            techStack: ['Spring Boot', 'Polymer.js', 'WaveMaker', 'LoopBack'],
        },
        {
            title: 'Senior Systems Engineer',
            company: 'Infosys Limited',
            duration: '2021 — 2022',
            location: 'India',
            isCurrent: false,
            responsibilities: [
                'Promoted for outstanding performance and technical contributions',
                'Took ownership of complex modules and feature development',
                'Provided technical guidance to team members',
                'Contributed to system design and architecture decisions',
            ],
            techStack: ['Java', 'Spring Boot', 'JavaScript', 'Angular'],
        },
        {
            title: 'Systems Engineer',
            company: 'Infosys Limited',
            duration: 'Dec 2019 — 2021',
            location: 'India',
            isCurrent: false,
            responsibilities: [
                'Started professional career in enterprise software development',
                'Worked on full-stack development for client projects',
                'Gained expertise in Java, Spring Boot, and front-end technologies',
                'Delivered quality code with strong adherence to best practices',
            ],
            techStack: ['Java', 'Spring Boot', 'HTML/CSS', 'JavaScript'],
        },
    ],

    // =========================================================================
    // SECTION 4: TECHNICAL SKILLS
    // =========================================================================
    technicalSkills: {
        productionProven: 'Spring Boot, Node.js, React.js, JavaScript/ES6+, Java, HTML5/CSS3, WaveMaker, Polymer.js, REST APIs',
        strongKnowledge: 'Angular, Express.js, TypeScript, Python, MongoDB, LoopBack.io, Git/GitHub/Bitbucket',
        aiIntegration: 'LLM API Integration (OpenAI, Gemini), Structured Output Enforcement, Context-Bounded AI, AI Decision Orchestration, Function Calling / Tool Use, Prompt Engineering',
        buildingDepth: 'Multi-Step Agent Loops, Docker, AWS (S3, EC2), Microservices Architecture',
    },

    // =========================================================================
    // SECTION 5: PROJECTS
    // =========================================================================
    enterpriseProjects: [
        {
            name: 'Cash Management',
            description: 'Built full-stack UI for Finacle cash management module — transaction tracking, liquidity dashboards, reconciliation workflows. Migrated legacy Polymer.js components to WaveMaker while maintaining backward compatibility across 50+ banking clients.',
            role: 'Primary UI developer — built screens, integrated Spring Boot APIs, handled Polymer → WaveMaker migration.',
            tech: ['Spring Boot', 'Node.js', 'Polymer.js', 'WaveMaker'],
        },
        {
            name: 'My Expenses',
            description: 'Built React frontend for Finacle expense management platform — submission forms, multi-level approval workflows, category-based filtering, real-time reporting dashboards. Connected to Express/Node.js APIs with MongoDB storage.',
            role: 'Frontend lead — built React UI, designed component architecture, integrated REST APIs for expense CRUD and approval flows.',
            tech: ['React', 'Node.js', 'Express', 'MongoDB'],
        },
        {
            name: 'Payment Services',
            description: 'Developed payment processing UI for Finacle — domestic and cross-border transactions, multiple payment methods, real-time settlement tracking. Built Angular frontend with LoopBack API integration. Wrote Spring Boot services for payment validation and routing logic.',
            role: 'Full-stack contributor — built Angular payment screens, implemented LoopBack APIs, wrote Spring Boot validation services.',
            tech: ['Spring Boot', 'Angular', 'LoopBack', 'DBMS'],
        },
    ],

    aiProjects: [
        {
            name: 'LLM-Powered Dynamic Localization Middleware',
            description: 'Middleware layer that intercepts English API responses and user language preference, sends them to an LLM with a structured prompt, enforces JSON output schema, and delivers localized content to the UI — eliminating the need for static i18n config files.',
            tech: ['Node.js', 'OpenAI / Gemini', 'JSON Schema', 'Middleware Pattern'],
            context: 'EdgeVerve — Finacle Banking',
            status: 'Production',
        },
        {
            name: 'Context-Bounded SDK Documentation Agent',
            description: 'CLI-based AI assistant (npm help "question") that takes user questions and answers ONLY from README and documentation files. Constrained to prevent hallucination — refuses to answer outside documented scope. Reduced support queries by ~40%.',
            tech: ['Node.js', 'OpenAI API', 'CLI Integration', 'Constraint Prompting'],
            context: 'EdgeVerve — SDK Tooling',
            status: 'Production',
        },
        {
            name: 'AI Decision Orchestrator for Adaptive UI',
            description: 'AI decision layer between API and UI that takes fixed API responses + user age metadata, selects the appropriate UI template from a predefined set (no content generation), and routes the UI to render the selected layout dynamically.',
            tech: ['Node.js', 'Gemini API', 'Decision Logic', 'Template Routing'],
            context: 'EdgeVerve — Banking UX',
            status: 'Production',
        },
        {
            name: 'AI-Powered Code Review Agent',
            description: 'Live interactive demo on this portfolio. Paste any code snippet — agent auto-detects language, sends to Gemini with constraint prompt (refuses non-code), scores across 5 quality dimensions, returns structured JSON with severity-tagged issues and a refactored snippet.',
            tech: ['Gemini API', 'Constraint Prompting', 'JSON Schema', 'Multi-Dimension Analysis'],
            context: 'Open Source — klinteng.com',
            status: 'Live Demo',
        },
        {
            name: 'Gemini Chat with Function Calling (This Website)',
            description: 'AI chat assistant on this portfolio using Gemini function calling with 4 tool definitions. LLM autonomously decides which tools to invoke. Profile data injected as structured context. Includes a transparent tool-call log showing raw function names and arguments.',
            tech: ['Gemini API', 'Function Calling', 'System Prompt', 'Vanilla JS'],
            context: 'Open Source — klinteng.com',
            status: 'Live Demo',
        },
    ],

    // =========================================================================
    // SECTION 6: AI INTEGRATION REAL-WORLD EXAMPLE
    // =========================================================================
    aiIntegrationStory: `At EdgeVerve, Klinten solved a recurring problem where clients would ask basic SDK integration questions that were already answered in README files and documentation. He built an AI-powered terminal assistant that takes the user's question + the SDK README/documentation as input context, sends it to an AI API with structured prompts, and returns precise step-by-step answers. This eliminated the need for clients to dig through large documentation and significantly reduced support queries.`,

    // =========================================================================
    // SECTION 7: EDUCATION
    // =========================================================================
    education: {
        degree: 'Bachelor of Technology (B.Tech)',
        field: 'Electrical and Electronics Engineering',
        university: 'Sri Krishnadevaraya University',
        duration: 'June 2015 — April 2019',
    },

    // =========================================================================
    // SECTION 8: UNIQUE SELLING POINTS
    // =========================================================================
    uniqueStrengths: [
        'Bridges traditional full-stack engineering with modern AI capabilities',
        'Has real production experience integrating AI into enterprise products (not just demos)',
        'Strong in both frontend and backend — true full-stack capability',
        'Enterprise banking domain expertise (Finacle platform at EdgeVerve)',
        'Practical prompt engineering skills applied to solve real business problems',
    ],

    // =========================================================================
    // =========================================================================
    //
    //  SECTION 9: RECRUITER Q&A
    //  
    //  Fill in your answers below. Replace the placeholder text with your 
    //  actual answer. Leave as empty string '' if you want the AI to skip 
    //  that question.
    //
    // =========================================================================
    // =========================================================================

    recruiterQA: {

        // =====================================================================
        // 9.1 CAREER & MOTIVATION
        // =====================================================================
        careerMotivation: {
            whyLookingForNewOpportunity: 'Looking for roles that combine full-stack development with AI integration',

            idealRoleOrTitle: 'Full Stack Developer with AI focus, or AI Integration Engineer',

            preferredCompanyCulture: 'Prefer product-based companies with innovation focus, open to both startups and enterprises',

            whereInFiveYears: 'Leading AI integration initiatives and architecting AI-powered enterprise solutions',

            whatMotivatesYou: 'Solving real problems with technology, especially using AI to simplify complex workflows',
        },

        // =====================================================================
        // 9.2 AVAILABILITY & LOGISTICS
        // =====================================================================
        availability: {
            noticePeriod: '30 days',

            openToRelocation: 'Open to relocation within India, prefer Bengaluru or Hyderabad',

            workModePreference: 'Prefer hybrid, open to remote or on-site',

            activeInterviewsOrOffers: 'Currently exploring opportunities, no offers in hand',

            earliestStartDate: 'Can start within 30 days of offer acceptance',
        },

        // =====================================================================
        // 9.3 COMPENSATION
        // =====================================================================
        compensation: {
            currentCTC: 'Prefer not to disclose',

            expectedCTC: 'Negotiable based on role and growth',

            flexibleOnCompensation: 'Yes, flexible for the right opportunity with growth potential',
        },

        // =====================================================================
        // 9.4 WORK AUTHORIZATION & VISA
        // =====================================================================
        workAuthorization: {
            requireVisaSponsorship: 'No visa sponsorship required for India',

            authorizedCountries: 'Authorized to work in India',

            hasValidPassport: 'Yes',
        },

        // =====================================================================
        // 9.5 TECHNICAL DEPTH
        // =====================================================================
        technicalDepth: {
            strongestTechnology: 'Spring Boot and Node.js for backend, React for frontend',

            agileExperience: 'Yes, worked in Agile/Scrum teams for 5+ years with 2-week sprints',

            cicdAndCloudExperience: 'Experience with Jenkins CI/CD, basic AWS (S3, EC2), Docker',

            versionControlTools: 'Git, GitHub, Bitbucket, JIRA for project management',

            teamLeadershipExperience: 'Mentored 3-4 junior developers, led small feature teams',

            certifications: 'No formal certifications yet, planning AWS Solutions Architect',
        },

        // =====================================================================
        // 9.6 ACHIEVEMENTS & IMPACT
        // =====================================================================
        achievements: {
            biggestAchievement: 'Built the AI-powered SDK assistant that reduced client support queries by 40%',

            challengingProblemSolved: 'Migrated a legacy Polymer.js application to React while maintaining backward compatibility for 50+ banking clients',

            awardsOrRecognition: 'Received Insta Award at Infosys for outstanding project delivery',

            costSavingsOrEfficiency: 'The AI SDK assistant saved approximately 20 hours/week of developer support time across the team',
        },

        // =====================================================================
        // 9.7 SOFT SKILLS & COMMUNICATION
        // =====================================================================
        softSkills: {
            handlingDisagreements: 'Prefer data-driven discussions, always open to others perspectives',

            internationalTeamExperience: 'Worked with US-based clients and distributed teams across time zones',

            presentationSkills: 'Comfortable presenting to stakeholders, have done product demos to client teams',

            languagesSpoken: 'English (fluent), Telugu (native), Hindi (conversational)',
        },

        // =====================================================================
        // 9.8 DOMAIN EXPERTISE
        // =====================================================================
        domainExpertise: {
            bankingFintechDepth: 'Deep experience with Finacle banking platform — cash management, payments, and expense modules',

            complianceExperience: 'Familiar with basic banking compliance requirements through project work',

            openToOtherDomains: 'Yes, open to healthcare, e-commerce, SaaS, and other domains',
        },

        // =====================================================================
        // 9.9 EDUCATION & LEARNING
        // =====================================================================
        educationAndLearning: {
            currentlyPursuingCertifications: 'Exploring Google AI/ML certifications and AWS cloud certifications',

            howDoYouStayUpdated: 'Follow tech blogs, YouTube channels, build side projects, and explore new AI tools regularly',

            conferencesOrMeetups: 'Attended internal Infosys tech conferences, have not spoken at public events yet',

            publishedContentOrOpenSource: 'Personal GitHub projects, planning to start a tech blog on AI integration',
        },

        // =====================================================================
        // 9.10 REFERENCES & BACKGROUND
        // =====================================================================
        referencesAndBackground: {
            canProvideReferences: 'Yes, can provide references from current and previous managers upon request',

            employmentGaps: 'No gaps in employment',

            infosysToEdgeverveTransition: 'EdgeVerve is a subsidiary of Infosys — it was an internal transfer/deputation to work on the Finacle product',
        },
    },

    // =========================================================================
    // SECTION 10: ADDITIONAL INFORMATION (Add anything extra here)
    // =========================================================================
    additionalInfo: `
- Klinten prefers to be called "Klinten" rather than "Bill" — please always refer to him as Klinten in conversation.
- Date of Birth: 30 January 1998
- Born in Gudur, Nellore District, Andhra Pradesh, India
    `,
};


// =============================================================================
// DO NOT EDIT BELOW THIS LINE
// This function builds the AI context from your profile data above
// =============================================================================

function buildProfileContext() {
    const p = PROFILE_DATA;
    const qa = p.recruiterQA;

    let context = '';

    // Personal Info
    context += `\n**Personal Info:**\n`;
    context += `- Full Name: ${p.personalInfo.fullName}\n`;
    context += `- Preferred Name: ${p.personalInfo.preferredName}\n`;
    context += `- Date of Birth: ${p.personalInfo.dateOfBirth}\n`;
    context += `- Birth Place: ${p.personalInfo.birthPlace}\n`;
    context += `- Location: ${p.personalInfo.location}\n`;
    context += `- Email: ${p.personalInfo.email}\n`;
    context += `- Phone: ${p.personalInfo.phone}\n`;
    context += `- LinkedIn: ${p.personalInfo.linkedin}\n`;
    context += `- GitHub: ${p.personalInfo.github}\n`;
    context += `- Website: ${p.personalInfo.website}\n`;
    context += `- Siblings: ${p.personalInfo.siblings}\n`;

    // Professional Summary
    context += `\n**Professional Summary:**\n${p.professionalSummary}\n`;

    // Work Experience
    context += `\n**Work Experience:**\n`;
    p.workExperience.forEach((role, i) => {
        context += `\n${i + 1}. ${role.title} at ${role.company} (${role.duration})${role.isCurrent ? ' [CURRENT ROLE]' : ''}\n`;
        context += `   Location: ${role.location}\n`;
        context += `   Responsibilities:\n`;
        role.responsibilities.forEach(r => {
            context += `   - ${r}\n`;
        });
        context += `   Tech: ${role.techStack.join(', ')}\n`;
    });

    // Technical Skills
    context += `\n**Technical Skills:**\n`;
    context += `- Production-Proven: ${p.technicalSkills.productionProven}\n`;
    context += `- Strong Knowledge: ${p.technicalSkills.strongKnowledge}\n`;
    context += `- AI Integration: ${p.technicalSkills.aiIntegration}\n`;
    context += `- Building Depth: ${p.technicalSkills.buildingDepth}\n`;

    // Enterprise Projects
    context += `\n**Enterprise Projects:**\n`;
    p.enterpriseProjects.forEach((proj, i) => {
        context += `${i + 1}. ${proj.name} — ${proj.description}`;
        if (proj.role) context += ` Role: ${proj.role}`;
        context += ` Tech: ${proj.tech.join(', ')}.\n\n`;
    });

    // AI Projects
    context += `**AI Projects:**\n`;
    p.aiProjects.forEach((proj, i) => {
        context += `${i + 1}. ${proj.name} — ${proj.description} Tech: ${proj.tech.join(', ')}.\n\n`;
    });

    // AI Integration Story
    context += `**Real-World AI Integration Example:**\n${p.aiIntegrationStory}\n`;

    // Education
    context += `\n**Education:**\n`;
    context += `- Degree: ${p.education.degree}\n`;
    context += `- Field: ${p.education.field}\n`;
    context += `- University: ${p.education.university}\n`;
    context += `- Duration: ${p.education.duration}\n`;

    // Unique Strengths
    context += `\n**What Makes Klinten Unique:**\n`;
    p.uniqueStrengths.forEach(s => {
        context += `- ${s}\n`;
    });

    // Recruiter Q&A — only include answered questions
    const qaSection = buildQAContext(qa);
    if (qaSection) {
        context += `\n**Recruiter Q&A — Additional Details:**\n${qaSection}`;
    }

    // Additional Info
    if (p.additionalInfo && !p.additionalInfo.includes('Replace this placeholder')) {
        context += `\n**Additional Information:**\n${p.additionalInfo}\n`;
    }

    return context;
}

function buildQAContext(qa) {
    let result = '';

    const sections = {
        'Career & Motivation': {
            whyLookingForNewOpportunity: 'Why looking for new opportunity',
            idealRoleOrTitle: 'Ideal role/title',
            preferredCompanyCulture: 'Preferred company culture',
            whereInFiveYears: 'Where in 5 years',
            whatMotivatesYou: 'What motivates him',
        },
        'Availability': {
            noticePeriod: 'Notice period',
            openToRelocation: 'Open to relocation',
            workModePreference: 'Work mode preference',
            activeInterviewsOrOffers: 'Active interviews/offers',
            earliestStartDate: 'Earliest start date',
        },
        'Compensation': {
            currentCTC: 'Current CTC',
            expectedCTC: 'Expected CTC',
            flexibleOnCompensation: 'Flexible on compensation',
        },
        'Work Authorization': {
            requireVisaSponsorship: 'Requires visa sponsorship',
            authorizedCountries: 'Authorized to work in',
            hasValidPassport: 'Has valid passport',
        },
        'Technical Depth': {
            strongestTechnology: 'Strongest technology',
            agileExperience: 'Agile/Scrum experience',
            cicdAndCloudExperience: 'CI/CD & Cloud experience',
            versionControlTools: 'Version control & tools',
            teamLeadershipExperience: 'Team leadership',
            certifications: 'Certifications',
        },
        'Achievements': {
            biggestAchievement: 'Biggest achievement',
            challengingProblemSolved: 'Challenging problem solved',
            awardsOrRecognition: 'Awards/recognition',
            costSavingsOrEfficiency: 'Cost savings/efficiency impact',
        },
        'Soft Skills': {
            handlingDisagreements: 'Handling disagreements',
            internationalTeamExperience: 'International team experience',
            presentationSkills: 'Presentation skills',
            languagesSpoken: 'Languages spoken',
        },
        'Domain Expertise': {
            bankingFintechDepth: 'Banking/Fintech depth',
            complianceExperience: 'Compliance experience',
            openToOtherDomains: 'Open to other domains',
        },
        'Education & Continuous Learning': {
            currentlyPursuingCertifications: 'Currently pursuing certifications',
            howDoYouStayUpdated: 'How stays updated',
            conferencesOrMeetups: 'Conferences/meetups',
            publishedContentOrOpenSource: 'Published content/open source',
        },
        'References & Background': {
            canProvideReferences: 'Can provide references',
            employmentGaps: 'Employment gaps',
            infosysToEdgeverveTransition: 'Infosys to EdgeVerve transition',
        },
    };

    for (const [sectionName, fields] of Object.entries(sections)) {
        const sectionKey = Object.keys(qa).find(k => {
            return Object.keys(fields).some(f => f in (qa[k] || {}));
        });

        if (!sectionKey || !qa[sectionKey]) continue;

        let sectionContent = '';
        for (const [fieldKey, label] of Object.entries(fields)) {
            const value = qa[sectionKey][fieldKey];
            if (value && value.trim() !== '') {
                sectionContent += `- ${label}: ${value}\n`;
            }
        }

        if (sectionContent) {
            result += `\n${sectionName}:\n${sectionContent}`;
        }
    }

    return result;
}
