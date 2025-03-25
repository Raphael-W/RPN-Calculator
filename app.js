const operands = {'+': 1,
            '-': 1,
            '*': 2,
            '/': 2,
            '^': 3,
            '(': 4,
            ')': 4}

const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

function countChar(string, char) {
    return string.split(char).length - 1;
}

function validateExpression(expression) {
    let bracketsClosed = countChar(expression, '(') === countChar(expression, ')');

    let invalidCharUsed = false;
    let miscAllowedChars = ['.', ' ']
    for (let i = 0; i < expression.length; i++) {
        let item = expression[i];
        if (!(digits.includes(item) || Object.keys(operands).includes(item) || miscAllowedChars.includes(item))) {
            invalidCharUsed = true;
        }
    }
    return bracketsClosed && !invalidCharUsed
}

function splitExpression(expression) {
    let splitList = [];
    let current = '';

    for (let i = 0; i < expression.length; i++) {
        let item = expression[i];
        if (Object.keys(operands).includes(item)) {
            if (current.length > 0) {
                splitList.push(current);
                current = '';
            }
            splitList.push(item);
        }

        else if (digits.includes(item) || item === '.') {
            current += item;
        }

        else if (item === ' ') {
            if (current.length > 0) {
                splitList.push(current);
                current = '';
            }
        }
    }

    if (current.length > 0) {
        splitList.push(current)
    }

    return splitList
}

function cleanupExpression(expression) {
    expression = splitExpression(expression);

    let outputExpression = [];
    let closeBrackets = false;

    for (let i = 0; i < expression.length; i++) {
        let item = expression[i];
        if (closeBrackets && Object.keys(operands).includes(item)) {
            outputExpression.push(')');
            closeBrackets = false;
        }

        if (item === '-' && ('+-*/^('.includes(expression[i - 1]) || i === 0)) {
            outputExpression.push('(');
            outputExpression.push('0')
            closeBrackets = true;
        }

        if (item === '(' && (!'+-*/^('.includes(expression[i - 1]) && i > 0)) {
            outputExpression.push('*');
        }

        outputExpression.push(item);
    }

    return outputExpression
}

function applyOperator(num1, num2, operator) {
    num1 = Number(num1)
    num2 = Number(num2)

    if (operator === '+') {
        return num1 + num2
    }
    else if (operator === '-') {
        return num1 - num2
    }
    else if (operator === '*') {
        return num1 * num2
    }
    else if (operator === '/') {
        return num1 / num2
    }
    else if (operator === '^') {
        return num1 ** num2
    }
}

function convertToRPN(expression) {
    let isValid = validateExpression(expression.join(" "));
    if (!isValid) {
        return null;
    }

    let operandStack = [];
    let evaluationStack = [];

    for (let i = 0; i < expression.length; i++) {
        let item = expression[i];
        let validNumber = !isNaN(parseFloat(item));

        if (!Object.keys(operands).includes(item) && !validNumber) {
            return null;
        }

        if (validNumber) {
            evaluationStack.push(item);
        }

        else if (item === '(') {
            operandStack.push(item);
        }

        else if (item === ')') {
            while (operandStack.length > 0 && operandStack[operandStack.length - 1] !== '(') {
                evaluationStack.push(operandStack.pop());
            }

            operandStack.pop();

        }

        else {
            while (operandStack.length > 0 &&
                   operandStack[operandStack.length - 1] !== '(' &&
                   operands[item] <= operands[operandStack[operandStack.length - 1]]) {
                evaluationStack.push(operandStack.pop());
            }
            operandStack.push(item);
        }
    }

    while (operandStack.length > 0) {
        evaluationStack.push(operandStack.pop());
    }

    return evaluationStack;
}

function evaluateRPN(inputRPN) {
    if (inputRPN === null) {
        return null;
    }

    let RPNExpression = [...inputRPN];

    let operandFound = true;
    while (operandFound) {
        operandFound = false;
        for (let i = 0; i < RPNExpression.length; i++) {
            if (Object.keys(operands).includes(RPNExpression[i])) {
                let result = applyOperator(RPNExpression[i - 2], RPNExpression[i - 1], RPNExpression[i]);
                RPNExpression.splice(i - 2, 3);
                RPNExpression.splice(i - 2, 0, result);
                operandFound = true
                break;
            }
        }
    }

    if (RPNExpression.length > 1) {
        return null;
    }

    if (RPNExpression[0] === Math.floor(RPNExpression[0])) {
        return Math.floor(RPNExpression[0]);
    }

    return RPNExpression[0];
}

function stringify(list) {
    let outputString = "";
    for (let i = 0; i < list.length - 1; i++) {
        outputString += list[i];
        if (!(list[i] === "(") && !(list[i + 1] === ")")) {
            outputString += " ";
        }
    }
    outputString += list[list.length - 1];
    return outputString;
}

let RPN = "";
let evaluation = null;
let cleanedExpression = [];

const answerText = document.getElementById("answer");
const cleanedText = document.getElementById("cleaned");
const RPNText = document.getElementById("rpn");
const container = document.getElementById('container');

window.onload = () => {
    document.getElementById("equation").focus();
}


document.getElementById("equation").addEventListener("input", function () {
    cleanedExpression = cleanupExpression(this.value);
    RPN = convertToRPN(cleanedExpression);
    evaluation = evaluateRPN(RPN);

    if (Number(evaluation) == evaluation) {
        answerText.textContent = "= " + evaluation;
        cleanedText.textContent = stringify(cleanedExpression);
        RPNText.textContent = RPN.join(" ");
    }

    else {
        answerText.textContent = "= ";
        cleanedText.textContent = "--";
        RPNText.textContent = "--";
    }
});
