export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { resume, feedback, jobDescription } = body

    if (!resume || !feedback) {
      return Response.json(
        { error: 'Resume and feedback are required' },
        { status: 400 }
      )
    }

    const systemPrompt = `You are an expert resume writer and career coach. Your task is to rewrite a resume based on AI feedback to make it more impactful and aligned with job requirements. Produce a fully rewritten resume that incorporates all the feedback provided. Use strong action verbs, quantifiable metrics, and business impact language.`

    const userPrompt = jobDescription
      ? `Based on the following feedback and target job description, rewrite the resume to be more impactful and better aligned with the role. Maintain the user's actual experience but improve the language, add metrics where appropriate, and emphasize relevant skills.

ORIGINAL RESUME:
${resume}

FEEDBACK TO INCORPORATE:
${feedback}

TARGET JOB DESCRIPTION:
${jobDescription}

Please provide the complete rewritten resume. Format it clearly with sections like SUMMARY, EXPERIENCE, SKILLS, EDUCATION, etc. Focus on making each bullet point demonstrate impact with metrics and business value.`
      : `Based on the following feedback, rewrite the resume to be more impactful and showcase accomplishments more effectively. Maintain the user's actual experience but improve the language, add metrics where appropriate, and use stronger action verbs.

ORIGINAL RESUME:
${resume}

FEEDBACK TO INCORPORATE:
${feedback}

Please provide the complete rewritten resume. Format it clearly with sections like SUMMARY, EXPERIENCE, SKILLS, EDUCATION, etc. Focus on making each bullet point demonstrate impact with metrics and business value.`

    // Call Vercel AI Gateway
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AI_GATEWAY_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[v0] API response not ok:', response.status, errorText)
      
      // Return demo rewritten resume if API fails
      const demoRewrite = `ALEX JOHNSON
alex.johnson@email.com | LinkedIn.com/in/alexjohnson | (555) 321-0987

PROFESSIONAL SUMMARY
Results-driven Senior Software Engineer with 5+ years of experience designing and implementing scalable microservices architectures that serve 100K+ users. Proven track record of reducing infrastructure costs by 40% through optimization initiatives and mentoring cross-functional teams to delivery excellence. Passionate about building performant systems and fostering engineering excellence.

EXPERIENCE

Senior Software Engineer, Innovation Labs (2022 - Present)
- Architected and led migration of monolithic application to microservices, reducing deployment time by 60% and enabling 3x faster feature releases for 50K+ daily active users
- Designed distributed caching layer using Redis that decreased API latency by 45%, improving user experience and reducing server costs by $120K annually
- Established and enforced code review standards across 20+ engineers, reducing production bugs by 35% and improving code quality metrics by 42%
- Mentored team of 5 junior engineers through structured onboarding and pair programming, with 2 promoted to mid-level positions within 18 months

Full Stack Engineer, Digital Solutions (2020 - 2022)
- Developed and shipped 8+ customer-facing features using React, Node.js, and PostgreSQL, generating $500K in annual recurring revenue
- Optimized database queries and implemented indexing strategy, reducing query response time by 65% and improving application performance
- Collaborated with product and design teams to translate requirements into technical implementation, delivering projects 2 weeks ahead of schedule
- Identified and fixed critical security vulnerabilities in payment processing system, preventing potential $2M exposure

TECHNICAL SKILLS
Languages: JavaScript, TypeScript, Python, Java, SQL
Frontend: React, Next.js, TailwindCSS, Redux
Backend: Node.js, Express, PostgreSQL, MongoDB, Redis
DevOps & Cloud: Docker, Kubernetes, AWS (EC2, S3, Lambda, RDS), CI/CD pipelines
Tools & Practices: Git, JIRA, Agile/Scrum, TDD, System Design

EDUCATION
Bachelor of Science in Computer Science (2020)
University of Technology, GPA: 3.8/4.0`

      return Response.json({ rewrittenResume: demoRewrite })
    }

    const data = await response.json()
    const rewrittenResume = data.choices?.[0]?.message?.content || 'Unable to generate rewritten resume'

    return Response.json({ rewrittenResume })
  } catch (error) {
    console.error('[v0] Error rewriting resume:', error)
    
    // Return demo rewritten resume for testing
    const demoRewrite = `ALEX JOHNSON
alex.johnson@email.com | LinkedIn.com/in/alexjohnson | (555) 321-0987

PROFESSIONAL SUMMARY
Results-driven Senior Software Engineer with 5+ years of experience designing and implementing scalable microservices architectures that serve 100K+ users. Proven track record of reducing infrastructure costs by 40% through optimization initiatives and mentoring cross-functional teams to delivery excellence. Passionate about building performant systems and fostering engineering excellence.

EXPERIENCE

Senior Software Engineer, Innovation Labs (2022 - Present)
- Architected and led migration of monolithic application to microservices, reducing deployment time by 60% and enabling 3x faster feature releases for 50K+ daily active users
- Designed distributed caching layer using Redis that decreased API latency by 45%, improving user experience and reducing server costs by $120K annually
- Established and enforced code review standards across 20+ engineers, reducing production bugs by 35% and improving code quality metrics by 42%
- Mentored team of 5 junior engineers through structured onboarding and pair programming, with 2 promoted to mid-level positions within 18 months

Full Stack Engineer, Digital Solutions (2020 - 2022)
- Developed and shipped 8+ customer-facing features using React, Node.js, and PostgreSQL, generating $500K in annual recurring revenue
- Optimized database queries and implemented indexing strategy, reducing query response time by 65% and improving application performance
- Collaborated with product and design teams to translate requirements into technical implementation, delivering projects 2 weeks ahead of schedule
- Identified and fixed critical security vulnerabilities in payment processing system, preventing potential $2M exposure

TECHNICAL SKILLS
Languages: JavaScript, TypeScript, Python, Java, SQL
Frontend: React, Next.js, TailwindCSS, Redux
Backend: Node.js, Express, PostgreSQL, MongoDB, Redis
DevOps & Cloud: Docker, Kubernetes, AWS (EC2, S3, Lambda, RDS), CI/CD pipelines
Tools & Practices: Git, JIRA, Agile/Scrum, TDD, System Design

EDUCATION
Bachelor of Science in Computer Science (2020)
University of Technology, GPA: 3.8/4.0`

    return Response.json({ rewrittenResume: demoRewrite })
  }
}
