import { Tool } from "@modelcontextprotocol/sdk/types.js";
import chalk from 'chalk';

interface Solution {
  id: string;
  content: string;
  generation: number;
  scores: Record<string, number>;
  compositeScore: number;
  parentSolutions: string[];
  timestamp: number;
}

interface ConsistencyCheck {
  id: string;
  description: string;
  weight: number;
}

interface EvolutionState {
  problemStatement: string;
  consistencyChecks: ConsistencyCheck[];
  currentGeneration: number;
  maxGenerations: number;
  populationSize: number;
  convergenceThreshold: number;
  solutions: Record<string, Solution>;
  generationHistory: Record<number, string[]>;
  bestSolution: Solution | null;
  isComplete: boolean;
  startTime: number;
}

interface CrossoverRecommendation {
  checkId: string;
  bestSolutionId: string;
  score: number;
  relevantContent: string;
}

export class EvolutionaryEngine {
  private evolutionState: EvolutionState | null = null;
  private disableLogging: boolean;

  constructor() {
    this.disableLogging = (process.env.DISABLE_EVOLUTION_LOGGING || "").toLowerCase() === "true";
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private log(message: string, level: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    if (this.disableLogging) return;

    const colors = {
      info: chalk.blue,
      success: chalk.green,
      warning: chalk.yellow,
      error: chalk.red
    };

    const icons = {
      info: '🧬',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };

    console.error(`${icons[level]} ${colors[level](message)}`);
  }

  public startEvolution(input: unknown): { content: Array<{ type: string; text: string }>; isError?: boolean } {
    try {
      const data = input as Record<string, unknown>;

      if (!data.problemStatement || typeof data.problemStatement !== 'string') {
        throw new Error('problemStatement is required and must be a string');
      }

      if (!data.consistencyChecks || !Array.isArray(data.consistencyChecks)) {
        throw new Error('consistencyChecks is required and must be an array');
      }

      const consistencyChecks: ConsistencyCheck[] = data.consistencyChecks.map((check: any, index: number) => ({
        id: `check_${index + 1}`,
        description: typeof check === 'string' ? check : check.description,
        weight: typeof check === 'object' && check.weight ? check.weight : 1.0
      }));

      this.evolutionState = {
        problemStatement: data.problemStatement,
        consistencyChecks,
        currentGeneration: 0,
        maxGenerations: (data.maxGenerations as number) || 5,
        populationSize: (data.populationSize as number) || 3,
        convergenceThreshold: (data.convergenceThreshold as number) || 0.95,
        solutions: {},
        generationHistory: {},
        bestSolution: null,
        isComplete: false,
        startTime: Date.now()
      };

      this.log(`Evolution started: ${this.evolutionState.problemStatement}`);
      this.log(`Consistency checks: ${consistencyChecks.length}, Max generations: ${this.evolutionState.maxGenerations}`);

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: 'started',
            problemStatement: this.evolutionState.problemStatement,
            consistencyChecks: this.evolutionState.consistencyChecks,
            currentGeneration: this.evolutionState.currentGeneration,
            maxGenerations: this.evolutionState.maxGenerations,
            populationSize: this.evolutionState.populationSize,
            message: 'Evolution initialized. Ready for solution generation.'
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: error instanceof Error ? error.message : String(error),
            status: 'failed'
          }, null, 2)
        }],
        isError: true
      };
    }
  }

  public addSolution(input: unknown): { content: Array<{ type: string; text: string }>; isError?: boolean } {
    try {
      if (!this.evolutionState) {
        throw new Error('Evolution not started. Call start_evolution first.');
      }

      const data = input as Record<string, unknown>;
      
      if (!data.content || typeof data.content !== 'string') {
        throw new Error('Solution content is required and must be a string');
      }

      const parentSolutions = Array.isArray(data.parentSolutions) ? data.parentSolutions as string[] : [];
      
      const solution: Solution = {
        id: this.generateId(),
        content: data.content,
        generation: this.evolutionState.currentGeneration,
        scores: {},
        compositeScore: 0,
        parentSolutions,
        timestamp: Date.now()
      };

      this.evolutionState.solutions[solution.id] = solution;

      if (!this.evolutionState.generationHistory[this.evolutionState.currentGeneration]) {
        this.evolutionState.generationHistory[this.evolutionState.currentGeneration] = [];
      }
      this.evolutionState.generationHistory[this.evolutionState.currentGeneration].push(solution.id);

      this.log(`Solution added to generation ${this.evolutionState.currentGeneration}: ${solution.id}`);

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: 'added',
            solutionId: solution.id,
            generation: solution.generation,
            currentPopulationSize: this.evolutionState.generationHistory[this.evolutionState.currentGeneration].length,
            targetPopulationSize: this.evolutionState.populationSize,
            message: `Solution ${solution.id} added to generation ${solution.generation}`
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: error instanceof Error ? error.message : String(error),
            status: 'failed'
          }, null, 2)
        }],
        isError: true
      };
    }
  }

  public scoreSolution(input: unknown): { content: Array<{ type: string; text: string }>; isError?: boolean } {
    try {
      if (!this.evolutionState) {
        throw new Error('Evolution not started. Call start_evolution first.');
      }

      const data = input as Record<string, unknown>;
      
      if (!data.solutionId || typeof data.solutionId !== 'string') {
        throw new Error('solutionId is required and must be a string');
      }

      if (!data.checkId || typeof data.checkId !== 'string') {
        throw new Error('checkId is required and must be a string');
      }

      if (typeof data.score !== 'number' || data.score < 0 || data.score > 1) {
        throw new Error('score is required and must be a number between 0 and 1');
      }

      const solution = this.evolutionState.solutions[data.solutionId];
      if (!solution) {
        throw new Error(`Solution ${data.solutionId} not found`);
      }

      const consistencyCheck = this.evolutionState.consistencyChecks.find(c => c.id === data.checkId);
      if (!consistencyCheck) {
        throw new Error(`Consistency check ${data.checkId} not found`);
      }

      solution.scores[data.checkId] = data.score;

      const totalWeightedScore = this.evolutionState.consistencyChecks.reduce((sum, check) => {
        const score = solution.scores[check.id] || 0;
        return sum + (score * check.weight);
      }, 0);

      const totalWeight = this.evolutionState.consistencyChecks.reduce((sum, check) => sum + check.weight, 0);
      solution.compositeScore = totalWeightedScore / totalWeight;

      if (!this.evolutionState.bestSolution || solution.compositeScore > this.evolutionState.bestSolution.compositeScore) {
        this.evolutionState.bestSolution = solution;
        this.log(`New best solution: ${solution.id} (score: ${solution.compositeScore.toFixed(3)})`, 'success');
      }

      const completedScores = Object.keys(solution.scores).length;
      const totalChecks = this.evolutionState.consistencyChecks.length;

      this.log(`Solution ${solution.id} scored ${data.score.toFixed(3)} for ${data.checkId} (${completedScores}/${totalChecks} checks complete)`);

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: 'scored',
            solutionId: solution.id,
            checkId: data.checkId,
            score: data.score,
            compositeScore: solution.compositeScore,
            completedScores: completedScores,
            totalChecks: totalChecks,
            isFullyScored: completedScores === totalChecks,
            message: `Solution ${solution.id} scored for ${data.checkId}`
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: error instanceof Error ? error.message : String(error),
            status: 'failed'
          }, null, 2)
        }],
        isError: true
      };
    }
  }

  public evolveGeneration(input: unknown): { content: Array<{ type: string; text: string }>; isError?: boolean } {
    try {
      if (!this.evolutionState) {
        throw new Error('Evolution not started. Call start_evolution first.');
      }

      const currentGenerationSolutions = this.evolutionState.generationHistory[this.evolutionState.currentGeneration] || [];
      
      if (currentGenerationSolutions.length === 0) {
        throw new Error('No solutions in current generation');
      }

      const solutions = currentGenerationSolutions.map(id => this.evolutionState!.solutions[id]);
      const fullyScored = solutions.filter(s => Object.keys(s.scores).length === this.evolutionState!.consistencyChecks.length);

      if (fullyScored.length === 0) {
        throw new Error('No fully scored solutions in current generation');
      }

      const crossoverRecommendations: CrossoverRecommendation[] = this.evolutionState.consistencyChecks.map(check => {
        const bestForCheck = fullyScored.reduce((best, current) => {
          const currentScore = current.scores[check.id] || 0;
          const bestScore = best.scores[check.id] || 0;
          return currentScore > bestScore ? current : best;
        });

        return {
          checkId: check.id,
          bestSolutionId: bestForCheck.id,
          score: bestForCheck.scores[check.id],
          relevantContent: this.extractRelevantContent(bestForCheck.content, check.description)
        };
      });

      const avgScore = fullyScored.reduce((sum, s) => sum + s.compositeScore, 0) / fullyScored.length;
      const bestScore = Math.max(...fullyScored.map(s => s.compositeScore));
      
      const hasConverged = bestScore >= this.evolutionState.convergenceThreshold;
      const maxGenerationsReached = this.evolutionState.currentGeneration >= this.evolutionState.maxGenerations - 1;

      if (hasConverged || maxGenerationsReached) {
        this.evolutionState.isComplete = true;
        const reason = hasConverged ? 'convergence' : 'max_generations';
        this.log(`Evolution complete: ${reason}. Best score: ${bestScore.toFixed(3)}`, 'success');
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              status: 'complete',
              reason,
              currentGeneration: this.evolutionState.currentGeneration,
              bestSolution: this.evolutionState.bestSolution,
              finalScore: bestScore,
              averageScore: avgScore,
              totalTime: Date.now() - this.evolutionState.startTime,
              message: `Evolution completed after ${this.evolutionState.currentGeneration + 1} generations`
            }, null, 2)
          }]
        };
      }

      this.evolutionState.currentGeneration++;
      this.log(`Evolving to generation ${this.evolutionState.currentGeneration}`);

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: 'evolved',
            newGeneration: this.evolutionState.currentGeneration,
            previousGenerationStats: {
              averageScore: avgScore,
              bestScore: bestScore,
              populationSize: fullyScored.length
            },
            crossoverRecommendations,
            guidance: {
              message: 'Create new solutions by combining the best aspects identified in crossoverRecommendations',
              populationTarget: this.evolutionState.populationSize,
              focusAreas: crossoverRecommendations.map(r => `${r.checkId}: Use aspects from solution ${r.bestSolutionId} (score: ${r.score.toFixed(3)})`)
            }
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: error instanceof Error ? error.message : String(error),
            status: 'failed'
          }, null, 2)
        }],
        isError: true
      };
    }
  }

  private extractRelevantContent(content: string, checkDescription: string): string {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const keywords = checkDescription.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    
    const relevantSentences = sentences.filter(sentence => 
      keywords.some(keyword => sentence.toLowerCase().includes(keyword))
    );

    return relevantSentences.length > 0 ? relevantSentences.join('. ') + '.' : content.substring(0, 200) + '...';
  }

  public getEvolutionStatus(): { content: Array<{ type: string; text: string }>; isError?: boolean } {
    if (!this.evolutionState) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: 'not_started',
            message: 'Evolution not started. Call start_evolution first.'
          }, null, 2)
        }]
      };
    }

    const currentGenerationSolutions = this.evolutionState.generationHistory[this.evolutionState.currentGeneration] || [];
    const solutions = currentGenerationSolutions.map(id => this.evolutionState!.solutions[id]);
    const fullyScored = solutions.filter(s => Object.keys(s.scores).length === this.evolutionState!.consistencyChecks.length);

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          status: 'active',
          currentGeneration: this.evolutionState.currentGeneration,
          maxGenerations: this.evolutionState.maxGenerations,
          populationSize: solutions.length,
          targetPopulationSize: this.evolutionState.populationSize,
          fullyScored: fullyScored.length,
          bestSolution: this.evolutionState.bestSolution,
          isComplete: this.evolutionState.isComplete,
          runningTime: Date.now() - this.evolutionState.startTime,
          generationHistory: Object.keys(this.evolutionState.generationHistory).map(gen => ({
            generation: parseInt(gen),
            solutionCount: this.evolutionState!.generationHistory[parseInt(gen)].length
          }))
        }, null, 2)
      }]
    };
  }
}

// Export static tool definitions for fast discovery
export const TOOLS: Tool[] = [
  // Tool definitions are now in http_server.ts to avoid duplication
];