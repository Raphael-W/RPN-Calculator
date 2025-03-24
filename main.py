operands = {'+': 1,
            '-': 1,
            '*': 2,
            '/': 2,
            '^': 3,
            '(': 4,
            ')': 4}

digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

def validateExpression(expression):
    bracketsClosed = expression.count('(') == expression.count(')')
    validCharsUsed = [(i in digits) or (i in operands.keys()) or (i == ' ') for i in expression]

    return all([bracketsClosed, validCharsUsed])

def cleanupExpression(listExpression):
    outputExpression = []
    closeBrackets = False
    for i in range(len(listExpression)):
        if closeBrackets and (listExpression[i] in operands.keys()):
            outputExpression.append(')')
            closeBrackets = False

        if (listExpression[i] == '-') and ((listExpression[i - 1] in '+-*/^(') or (i == 0)):
            outputExpression += ['(', '0']
            closeBrackets = True

        if (listExpression[i] == '(') and (listExpression[i - 1] not in '+-*/^(') and (i > 0):
            outputExpression.append('*')

        outputExpression.append(listExpression[i])

    return outputExpression

def splitExpression(expression):
    splitList = []
    current = ''
    for i in range(len(expression)):
        if expression[i] in operands.keys():
            if len(current) > 0:
                splitList.append(current)
                current = ''

            splitList.append(expression[i])

        elif (expression[i] in digits) or (expression[i] == '.'):
            current += expression[i]

        elif expression[i] == ' ':
            if len(current) > 0:
                splitList.append(current)
                current = ''

    if len(current) > 0:
        splitList.append(current)

    return splitList


def convertToRPN(expression):
    expression = splitExpression(expression)
    expression = cleanupExpression(expression)
    isValid = validateExpression(expression)
    if not isValid:
        return None

    operandStack = []
    evaluationStack = []
    for i in expression:

        try:
            float(i)
            validNumber = True
        except:
            validNumber = False

        if (i not in operands.keys()) and (not validNumber):
            return None

        if validNumber:
            evaluationStack.append(i)

        if i in operands.keys():
            if len(operandStack) > 0:
                while i == ')' and operandStack[-1] != '(':
                    poppedItem = operandStack.pop()
                    if poppedItem not in '()':
                        evaluationStack.append(poppedItem)

                    if len(operandStack) == 0:
                        break

            if len(operandStack) > 0:
                if operands[i] < operands[operandStack[-1]]:
                    poppedItem = operandStack.pop()
                    if poppedItem not in '()':
                        evaluationStack.append(poppedItem)

            operandStack.append(i)

    for i in range(len(operandStack) - 1, -1, -1):
        if operandStack[i] not in '()':
            evaluationStack.append(operandStack[i])

    return evaluationStack

def applyOperator(num1, num2, operator):
    num1 = float(num1)
    num2 = float(num2)

    if operator == '+':
        return num1 + num2
    elif operator == '-':
        return num1 - num2
    elif operator == '*':
        return num1 * num2
    elif operator == '/':
        return num1 / num2
    elif operator == '^':
        return num1 ** num2

def evaluateRPN(RPNExpression):
    if RPNExpression is None:
        return None

    operandFound = True
    while operandFound:
        operandFound = False
        for i in range(len(RPNExpression)):
            if RPNExpression[i] in operands.keys():
                result = applyOperator(RPNExpression[i - 2], RPNExpression[i - 1], RPNExpression[i])
                RPNExpression.pop(i)
                RPNExpression.pop(i - 1)
                RPNExpression.pop(i - 2)
                RPNExpression.insert(i - 2, result)
                operandFound = True
                break
    if len(RPNExpression) > 1:
        return None

    if RPNExpression[0] == int(RPNExpression[0]):
        return int(RPNExpression[0])
    return RPNExpression[0]

equation = "((3 + 5) * (12 / 4)) - (2^3) + ((14 - 6) * (7 + 3) / 5)"

while True:
    equation = input(">> ")
    RPN = convertToRPN(equation)
    print(RPN)
    print(evaluateRPN(RPN))
    print()
