import { Difficulty, Operateur, Problem } from "./types";

export function generateMathProblem(difficulty: Difficulty): Problem {
    let problem: Problem = {
        num1: 0,
        num2: 0,
        operator: Operateur.Addition,
        answer: 0
    };

    switch (difficulty) {
        case Difficulty.Normal:
            problem.num1 = Math.floor(Math.random() * 50) + 10; // 10 to 59
            problem.num2 = Math.floor(Math.random() * 50) + 10; // 10 to 59
            problem.operator = randomOperator([Operateur.Addition, Operateur.Subtraction, Operateur.Multiply]);
            break;
    
        case Difficulty.Hard:
            problem.num1 = Math.floor(Math.random() * 100) + 50; // 50 to 149
            problem.num2 = Math.floor(Math.random() * 100) + 50; // 50 to 149
            problem.operator = randomOperator([Operateur.Multiply, Operateur.Divide, Operateur.Modulo]);
            break;
    
        default: // Easy
            problem.num1 = Math.floor(Math.random() * 10) + 1; // 1 to 10
            problem.num2 = Math.floor(Math.random() * 10) + 1; // 1 to 10
            problem.operator = randomOperator([Operateur.Addition, Operateur.Subtraction]);
    }

    problem.answer = calculateAnswer(problem.num1, problem.num2, problem.operator);
    return problem;
};

function calculateAnswer(num1: number, num2: number, operateur: Operateur): number {
    switch (operateur) {
      case Operateur.Addition:
        return num1 + num2;
      case Operateur.Subtraction:
        return num1 - num2;
      case Operateur.Multiply:
        return num1 * num2;
      case Operateur.Divide:
        return num2 !== 0 ? num1 / num2 : 0; // Avoid division by zero
      case Operateur.Modulo:
        return num2 !== 0 ? num1 % num2 : 0; // Avoid modulo by zero
      default:
        throw new Error("Unknown operator");
    }
}

function randomOperator(operators: Operateur[]): Operateur {
    const index = Math.floor(Math.random() * operators.length);
    return operators[index];
}