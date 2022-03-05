export const shuntingYard = (input: string) =>{
  const specialCharacters = ['+', '-', '*', '/', '%'];
  const allCharacters = input.split('');

  const prefixes = [];
  const numbers = [];

  // go through all chars of input
  for (let i = 0; i < allCharacters.length; i++) {
    const thisCharacter = allCharacters[i];

    // If the char is contained within the list of 'special chars', add it to list of prefixes.
    if (specialCharacters.includes(thisCharacter))
      prefixes.push(thisCharacter);

    // If it's a number, just add it to the array of numbers
    else if (thisCharacter !== ' ')
      numbers.push(thisCharacter);
  }

  // Merge both arrays
  const final = [...prefixes, ...numbers];

  // Back to string
  const finalString = final.join(' ');

  console.log(final);
  console.log('String format: ' + finalString);
}

const isAlpha = (c: string) => {
  return c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z'
}

const isDigit = (c: string) => {
  return c >= '0' && c <= '9'
}

const isOperator = (c: string) => {
  return (!isAlpha(c) && !isDigit(c))
}

const getPriority = (c: string) => {
  if (c == '-' || c == '+')
    return 1
  if (c == '*' || c == '/')
    return 2
  else if (c == '^')
    return 3
  return 0
}

const infixToPostfix = (str: string[]) => {
  let infix = `(${str.toString()})`

  let l = infix.length
  const charStack: string[] = []
  let output = ""

  for (let i = 0; i < l; i++) {
    if (isAlpha(infix.charAt(i)) || isDigit(infix.charAt(i)))
      output += infix.charAt(i)
  }
}

/* static String infixToPostfix(char[] infix1)
{
  System.out.println(infix1);
  String infix = '(' + String.valueOf(infix1) + ')';

  int l = infix.length();
  Stack<Character> char_stack = new Stack<>();
  String output="";

  for (int i = 0; i < l; i++)
  {

    // If the scanned character is an
    // operand, add it to output.
    if (isalpha(infix.charAt(i)) || isdigit(infix.charAt(i)))
      output += infix.charAt(i);

      // If the scanned character is an
    // ‘(‘, push it to the stack.
    else if (infix.charAt(i) == '(')
      char_stack.add('(');

      // If the scanned character is an
      // ‘)’, pop and output from the stack
    // until an ‘(‘ is encountered.
    else if (infix.charAt(i) == ')')
    {
      while (char_stack.peek() != '(')
      {
        output += char_stack.peek();
        char_stack.pop();
      }

      // Remove '(' from the stack
      char_stack.pop();
    }

    // Operator found
    else {
      if (isOperator(char_stack.peek()))
      {
        while ((getPriority(infix.charAt(i)) <
          getPriority(char_stack.peek()))
        || (getPriority(infix.charAt(i)) <=
          getPriority(char_stack.peek())
          && infix.charAt(i) == '^'))
        {
          output += char_stack.peek();
          char_stack.pop();
        }

        // Push current Operator on stack
        char_stack.add(infix.charAt(i));
      }
    }
  }
  while(!char_stack.empty()){
    output += char_stack.pop();
  }
  return output;
}

static String infixToPrefix(char[] infix)
{       Reverse String Replace ( with ) and vice versa Get Postfix Reverse Postfix
  int l = infix.length;

  // Reverse infix
  String infix1 = reverse(infix, 0, l - 1);
  infix = infix1.toCharArray();

  // Replace ( with ) and vice versa
  for (int i = 0; i < l; i++)
  {

    if (infix[i] == '(')
    {
      infix[i] = ')';
      i++;
    }
    else if (infix[i] == ')')
    {
      infix[i] = '(';
      i++;
    }
  }

  String prefix = infixToPostfix(infix);

  // Reverse postfix
  prefix = reverse(prefix.toCharArray(), 0, l-1);

  return prefix;
}*/