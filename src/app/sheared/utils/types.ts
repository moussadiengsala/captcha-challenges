export enum Operateur {Addition = "+", Subtraction = "-", Divide = "/", Multiply = "*", Modulo = "%"}
export enum Difficulty { Easy = "easy", Normal = "normal", Hard = "hard"}

export type Problem = {
  num1: number
  num2: number
  operator: Operateur
  answer: number
}

export enum ChallengeImageTypes {
    Living = 'Living',
    Technology = 'Technology',
    Vehicle = 'Vehicle',
    Animal = 'Animal',
    Nature = 'Nature',
    Food = 'Food',
    Architecture = 'Architecture',
    Art = 'Art',
    Sports = 'Sports',
}

export type Icon = {
    id: string
    name: string
    icon: string
    challengeImageType: ChallengeImageTypes[]
}

export type Challenges = {
    message: string
    challenge: ChallengeImageTypes
}

export type ImageCaptcha = {
    challenge: Challenges
    solutions: Icon[]
    all: Icon[]
}

export enum PageType {
    Text = 'TEXT',
    Math = 'MATH',
    Image = 'IMAGE',
}
  
export interface Page {
    id: string; // Unique identifier for the page
    type: PageType; // Page type from the enum
    index: number; // Order or position in the form
    title?: string; // Optional title for the page
    isComplete: boolean; // Flag to indicate whether the page has been completed
    attempts: number
    metadata: ResultCaptchaText | ResultCaptchaMath | ResultCaptchaImage
}

export type Pages = {
    pages: Page[]
    step: number
}

export type ResultCaptchaText = {
    captchaCode: string
    userInput: string
    isValid: boolean
}

export type ResultCaptchaMath = {
    problems: Problem | null
    userInput: string
    difficulty: Difficulty
    isValid: boolean
}

export type ResultCaptchaImage = {
    imageCptcha: ImageCaptcha | null
    userInput: (string | null)[] | null
    isValid: boolean
}

export enum AlertVariant { 
    Error = "error", 
    Info = "info", 
    Success = "success", 
    Warning = "warning"
}

export interface Alert {
    variant: AlertVariant;
    title: string;
    message: string;
}