/**
 * AI Impact Analyzer
 * Comprehensive system for analyzing AI's contribution to academic work
 */

class AIImpactAnalyzer {
    constructor() {
        this.impactCategories = {
            // Minimal Impact (0-20%)
            minimal: {
                threshold: 0.2,
                indicators: [
                    'simple factual questions',
                    'definition requests',
                    'clarification queries',
                    'formatting help',
                    'spell check',
                    'grammar check'
                ],
                description: 'AI provided basic assistance without influencing content'
            },
            
            // Supportive Impact (20-40%)
            supportive: {
                threshold: 0.4,
                indicators: [
                    'brainstorming assistance',
                    'source suggestions',
                    'outline feedback',
                    'concept explanations',
                    'methodology questions',
                    'reference formatting'
                ],
                description: 'AI supported the research process without creating content'
            },
            
            // Collaborative Impact (40-60%)
            collaborative: {
                threshold: 0.6,
                indicators: [
                    'draft feedback',
                    'argument development',
                    'data analysis help',
                    'code debugging',
                    'literature review assistance',
                    'hypothesis refinement'
                ],
                description: 'AI actively collaborated in developing ideas and content'
            },
            
            // Substantial Impact (60-80%)
            substantial: {
                threshold: 0.8,
                indicators: [
                    'content generation',
                    'code writing',
                    'analysis creation',
                    'thesis development',
                    'methodology design',
                    'comprehensive editing'
                ],
                description: 'AI significantly contributed to creating original content'
            },
            
            // Primary Author (80-100%)
            primary: {
                threshold: 1.0,
                indicators: [
                    'complete document writing',
                    'full code implementation',
                    'entire analysis creation',
                    'comprehensive research',
                    'autonomous content generation',
                    'minimal human input'
                ],
                description: 'AI functioned as primary content creator',
                warning: true
            }
        };

        this.contentPatterns = {
            // Patterns indicating AI-generated content
            aiGenerated: {
                fullParagraphs: /(?:^|\n\n)(?:[A-Z][^.!?]*[.!?]\s*){3,}/gm,
                listGeneration: /(?:^\d+\.|^[-•*])\s+.+(?:\n(?:\d+\.|[-•*])\s+.+){2,}/gm,
                codeBlocks: /```[\s\S]*?```/g,
                structuredContent: /^(?:Introduction|Background|Methods|Results|Discussion|Conclusion):/gm,
                academicPhrases: /(?:furthermore|moreover|consequently|nevertheless|notwithstanding|aforementioned)/gi
            },
            
            // Patterns indicating human input
            humanInput: {
                questions: /(?:can you|could you|please|help me|i need|what is|how do)/gi,
                personalContext: /(?:my|i'm|i am|our|we're|my professor|my thesis)/gi,
                corrections: /(?:no,|actually,|wait,|sorry,|i meant)/gi,
                specificRequests: /(?:change|modify|adjust|fix|update|revise)/gi
            },
            
            // Collaboration indicators
            collaboration: {
                iterations: /(?:try again|another version|different approach|revise this)/gi,
                feedback: /(?:better|worse|i like|i don't like|perfect|not quite)/gi,
                incorporation: /(?:based on|using your|from what you|as you suggested)/gi
            }
        };

        this.taskCategories = {
            writing: {
                weight: 1.0,
                subtasks: {
                    'essay_writing': { impact: 0.8, keywords: ['write essay', 'draft paper', 'compose'] },
                    'paragraph_creation': { impact: 0.7, keywords: ['write paragraph', 'create section'] },
                    'outline_generation': { impact: 0.4, keywords: ['create outline', 'structure'] },
                    'editing': { impact: 0.3, keywords: ['edit', 'revise', 'improve'] },
                    'proofreading': { impact: 0.1, keywords: ['check grammar', 'fix spelling'] }
                }
            },
            
            research: {
                weight: 0.9,
                subtasks: {
                    'literature_review': { impact: 0.6, keywords: ['find sources', 'review literature'] },
                    'data_analysis': { impact: 0.7, keywords: ['analyze data', 'statistical analysis'] },
                    'hypothesis_development': { impact: 0.5, keywords: ['develop hypothesis', 'research question'] },
                    'methodology_design': { impact: 0.6, keywords: ['research method', 'study design'] },
                    'source_evaluation': { impact: 0.3, keywords: ['evaluate source', 'credible'] }
                }
            },
            
            coding: {
                weight: 1.0,
                subtasks: {
                    'implementation': { impact: 0.9, keywords: ['write code', 'implement', 'create function'] },
                    'debugging': { impact: 0.5, keywords: ['debug', 'fix error', 'troubleshoot'] },
                    'optimization': { impact: 0.6, keywords: ['optimize', 'improve performance'] },
                    'explanation': { impact: 0.2, keywords: ['explain code', 'how does'] },
                    'conversion': { impact: 0.7, keywords: ['convert to', 'translate code'] }
                }
            },
            
            analysis: {
                weight: 0.9,
                subtasks: {
                    'statistical': { impact: 0.8, keywords: ['statistical test', 'correlation', 'regression'] },
                    'qualitative': { impact: 0.7, keywords: ['thematic analysis', 'content analysis'] },
                    'interpretation': { impact: 0.5, keywords: ['interpret results', 'what means'] },
                    'visualization': { impact: 0.6, keywords: ['create graph', 'plot data', 'visualize'] },
                    'synthesis': { impact: 0.6, keywords: ['synthesize', 'combine findings'] }
                }
            }
        };
    }

    /**
     * Perform comprehensive analysis of AI conversation
     * @param {string} conversation - The full conversation text
     * @param {object} metadata - Additional metadata about the conversation
     * @returns {object} Detailed impact analysis
     */
    analyzeConversation(conversation, metadata = {}) {
        const messages = this.parseMessages(conversation, metadata.format);
        const analysis = {
            summary: {
                totalMessages: messages.length,
                userMessages: messages.filter(m => m.role === 'user').length,
                aiMessages: messages.filter(m => m.role === 'assistant').length,
                totalWords: 0,
                aiGeneratedWords: 0,
                humanWords: 0
            },
            tasks: [],
            impactScore: 0,
            impactCategory: '',
            primaryContributions: [],
            specificExamples: [],
            ethicalConcerns: [],
            citationRecommendations: [],
            detailedBreakdown: {}
        };

        // Analyze each message exchange
        for (let i = 0; i < messages.length; i++) {
            const message = messages[i];
            const context = this.getMessageContext(messages, i);
            
            if (message.role === 'user') {
                const task = this.identifyTask(message.content, context);
                if (task) {
                    analysis.tasks.push(task);
                }
                analysis.summary.humanWords += this.countWords(message.content);
            } else {
                const impact = this.analyzeAIResponse(message.content, context);
                this.updateAnalysis(analysis, impact);
                analysis.summary.aiGeneratedWords += impact.generatedWords;
            }
        }

        // Calculate overall impact
        analysis.impactScore = this.calculateOverallImpact(analysis);
        analysis.impactCategory = this.determineImpactCategory(analysis.impactScore);
        
        // Generate specific examples and recommendations
        analysis.specificExamples = this.extractSpecificExamples(messages);
        analysis.ethicalConcerns = this.identifyEthicalConcerns(analysis);
        analysis.citationRecommendations = this.generateCitationRecommendations(analysis);
        
        // Create detailed breakdown
        analysis.detailedBreakdown = this.createDetailedBreakdown(analysis, messages);

        return analysis;
    }

    /**
     * Parse messages with enhanced context awareness
     */
    parseMessages(conversation, format) {
        const messages = [];
        const patterns = {
            chatgpt: {
                user: /^(?:User|You):\s*/gm,
                assistant: /^(?:Assistant|ChatGPT|GPT):\s*/gm
            },
            claude: {
                user: /^Human:\s*/gm,
                assistant: /^(?:Assistant|Claude):\s*/gm
            },
            generic: {
                user: /^(?:User|You|Human|Q):\s*/gm,
                assistant: /^(?:Assistant|AI|A|ChatGPT|Claude|GPT):\s*/gm
            }
        };

        const selectedPattern = patterns[format] || patterns.generic;
        
        // Split conversation into messages
        const splits = conversation.split(/\n(?=(?:User|You|Human|Assistant|AI|ChatGPT|Claude|GPT):)/);
        
        splits.forEach((split, index) => {
            const isUser = selectedPattern.user.test(split);
            const isAssistant = selectedPattern.assistant.test(split);
            
            if (isUser || isAssistant) {
                const content = split.replace(/^[^:]+:\s*/, '').trim();
                messages.push({
                    index,
                    role: isUser ? 'user' : 'assistant',
                    content,
                    wordCount: this.countWords(content),
                    timestamp: this.extractTimestamp(split),
                    metadata: this.extractMetadata(content)
                });
            }
        });

        return messages;
    }

    /**
     * Identify the type of task requested
     */
    identifyTask(content, context) {
        const lowercaseContent = content.toLowerCase();
        
        for (const [category, categoryData] of Object.entries(this.taskCategories)) {
            for (const [subtask, subtaskData] of Object.entries(categoryData.subtasks)) {
                for (const keyword of subtaskData.keywords) {
                    if (lowercaseContent.includes(keyword)) {
                        return {
                            category,
                            subtask,
                            impact: subtaskData.impact * categoryData.weight,
                            request: content.substring(0, 100) + '...',
                            context: context.previousTopic
                        };
                    }
                }
            }
        }

        // Analyze intent if no keywords match
        return this.analyzeIntent(content, context);
    }

    /**
     * Analyze AI response for impact
     */
    analyzeAIResponse(content, context) {
        const impact = {
            generatedWords: this.countWords(content),
            contentType: this.identifyContentType(content),
            complexity: this.assessComplexity(content),
            originality: this.assessOriginality(content, context),
            technicalDepth: this.assessTechnicalDepth(content),
            academicQuality: this.assessAcademicQuality(content)
        };

        // Check for specific patterns
        impact.containsFullParagraphs = this.contentPatterns.aiGenerated.fullParagraphs.test(content);
        impact.containsCode = this.contentPatterns.aiGenerated.codeBlocks.test(content);
        impact.containsStructuredContent = this.contentPatterns.aiGenerated.structuredContent.test(content);
        impact.containsLists = this.contentPatterns.aiGenerated.listGeneration.test(content);

        // Calculate impact score for this response
        impact.score = this.calculateResponseImpact(impact);

        return impact;
    }

    /**
     * Calculate overall impact score
     */
    calculateOverallImpact(analysis) {
        let totalImpact = 0;
        let weights = 0;

        // Task-based impact
        analysis.tasks.forEach(task => {
            totalImpact += task.impact;
            weights += 1;
        });

        // Content generation ratio
        const generationRatio = analysis.summary.aiGeneratedWords / 
                               (analysis.summary.humanWords + analysis.summary.aiGeneratedWords);
        totalImpact += generationRatio * 0.5;
        weights += 0.5;

        // Message initiation analysis
        const aiInitiatedContent = this.analyzeAIInitiation(analysis);
        totalImpact += aiInitiatedContent * 0.3;
        weights += 0.3;

        // Complexity and depth factors
        const complexityScore = this.calculateComplexityScore(analysis);
        totalImpact += complexityScore * 0.2;
        weights += 0.2;

        return weights > 0 ? totalImpact / weights : 0;
    }

    /**
     * Determine impact category based on score
     */
    determineImpactCategory(score) {
        for (const [category, data] of Object.entries(this.impactCategories)) {
            if (score <= data.threshold) {
                return {
                    category,
                    description: data.description,
                    warning: data.warning || false,
                    percentage: Math.round(score * 100)
                };
            }
        }
        return this.impactCategories.primary;
    }

    /**
     * Extract specific examples of AI contribution
     */
    extractSpecificExamples(messages) {
        const examples = [];
        
        for (let i = 0; i < messages.length - 1; i++) {
            if (messages[i].role === 'user' && messages[i + 1].role === 'assistant') {
                const userRequest = messages[i].content;
                const aiResponse = messages[i + 1].content;
                
                // Check for significant contributions
                if (this.isSignificantContribution(userRequest, aiResponse)) {
                    examples.push({
                        request: userRequest.substring(0, 150) + '...',
                        response: aiResponse.substring(0, 150) + '...',
                        type: this.categorizeContribution(userRequest, aiResponse),
                        wordCount: this.countWords(aiResponse)
                    });
                }
            }
        }

        return examples;
    }

    /**
     * Identify ethical concerns
     */
    identifyEthicalConcerns(analysis) {
        const concerns = [];

        // Check for excessive AI generation
        if (analysis.impactScore > 0.7) {
            concerns.push({
                level: 'high',
                issue: 'AI appears to be primary content creator',
                recommendation: 'Ensure human oversight and original thinking are clearly demonstrated'
            });
        }

        // Check for potential plagiarism indicators
        if (analysis.summary.aiGeneratedWords > analysis.summary.humanWords * 3) {
            concerns.push({
                level: 'medium',
                issue: 'AI-generated content significantly exceeds human input',
                recommendation: 'Review content to ensure it reflects your understanding'
            });
        }

        // Check for academic integrity issues
        const academicIntegrity = this.assessAcademicIntegrity(analysis);
        if (academicIntegrity.concerns.length > 0) {
            concerns.push(...academicIntegrity.concerns);
        }

        return concerns;
    }

    /**
     * Generate citation recommendations
     */
    generateCitationRecommendations(analysis) {
        const recommendations = [];
        const impactLevel = analysis.impactCategory.category;

        // Base recommendation
        recommendations.push({
            type: 'primary',
            description: `AI provided ${impactLevel} assistance (${analysis.impactCategory.percentage}% impact)`,
            citation: this.generatePrimaryCitation(analysis)
        });

        // Specific task citations
        const taskGroups = this.groupTasks(analysis.tasks);
        for (const [category, tasks] of Object.entries(taskGroups)) {
            if (tasks.length > 0) {
                recommendations.push({
                    type: 'task-specific',
                    category,
                    description: `${tasks.length} ${category} tasks completed with AI assistance`,
                    citation: this.generateTaskCitation(category, tasks)
                });
            }
        }

        // Content generation citations
        if (analysis.specificExamples.length > 0) {
            const contentTypes = this.categorizeExamples(analysis.specificExamples);
            for (const [type, examples] of Object.entries(contentTypes)) {
                recommendations.push({
                    type: 'content-specific',
                    contentType: type,
                    description: `AI generated ${examples.length} ${type} sections`,
                    citation: this.generateContentCitation(type, examples)
                });
            }
        }

        return recommendations;
    }

    /**
     * Create detailed breakdown of AI impact
     */
    createDetailedBreakdown(analysis, messages) {
        return {
            conversationFlow: this.analyzeConversationFlow(messages),
            contentAnalysis: this.performContentAnalysis(messages),
            collaborationPattern: this.identifyCollaborationPattern(messages),
            knowledgeContribution: this.assessKnowledgeContribution(messages),
            criticalThinking: this.assessCriticalThinking(messages),
            originalityAssessment: this.performOriginalityAssessment(messages)
        };
    }

    // Helper methods
    countWords(text) {
        return text.split(/\s+/).filter(word => word.length > 0).length;
    }

    getMessageContext(messages, index) {
        return {
            previousMessage: index > 0 ? messages[index - 1] : null,
            nextMessage: index < messages.length - 1 ? messages[index + 1] : null,
            conversationProgress: index / messages.length,
            previousTopic: this.identifyTopic(messages.slice(Math.max(0, index - 3), index))
        };
    }

    isSignificantContribution(request, response) {
        const responseWords = this.countWords(response);
        const requestWords = this.countWords(request);
        
        return responseWords > requestWords * 2 || 
               responseWords > 100 ||
               this.contentPatterns.aiGenerated.codeBlocks.test(response) ||
               this.contentPatterns.aiGenerated.structuredContent.test(response);
    }

    categorizeContribution(request, response) {
        if (this.contentPatterns.aiGenerated.codeBlocks.test(response)) {
            return 'code_generation';
        }
        if (this.contentPatterns.aiGenerated.structuredContent.test(response)) {
            return 'structured_writing';
        }
        if (this.contentPatterns.aiGenerated.listGeneration.test(response)) {
            return 'list_creation';
        }
        if (response.length > 1000) {
            return 'extended_writing';
        }
        return 'general_assistance';
    }

    generatePrimaryCitation(analysis) {
        const date = new Date().toLocaleDateString();
        const impact = analysis.impactCategory;
        
        return {
            apa: `Artificial Intelligence Assistant. (${date}). *Collaborative academic support: ${impact.description}* [Large language model]. Impact level: ${impact.percentage}%.`,
            mla: `"${impact.description}." *AI Assistant*, ${date}. Large Language Model. Impact level: ${impact.percentage}%.`,
            chicago: `AI Assistant. "${impact.description}." Large Language Model. Accessed ${date}. Impact level: ${impact.percentage}%.`
        };
    }

    // Additional helper methods would continue...
    assessComplexity(content) {
        // Implement complexity assessment
        return 0.5;
    }

    assessOriginality(content, context) {
        // Implement originality assessment
        return 0.5;
    }

    assessTechnicalDepth(content) {
        // Implement technical depth assessment
        return 0.5;
    }

    assessAcademicQuality(content) {
        // Implement academic quality assessment
        return 0.5;
    }

    analyzeIntent(content, context) {
        // Implement intent analysis
        return null;
    }

    extractTimestamp(text) {
        // Implement timestamp extraction
        return null;
    }

    extractMetadata(content) {
        // Implement metadata extraction
        return {};
    }

    groupTasks(tasks) {
        // Group tasks by category
        const groups = {};
        tasks.forEach(task => {
            if (!groups[task.category]) {
                groups[task.category] = [];
            }
            groups[task.category].push(task);
        });
        return groups;
    }
}

// Export for use in index.html
window.AIImpactAnalyzer = AIImpactAnalyzer;