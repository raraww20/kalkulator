const displayEl = document.getElementById('display');
const exprEl = document.getElementById('expr');

let current = "0";
let previous = null;
let operator = null;
let justEvaluated = false;
let lastExpr = null;

function formatNumber(numStr){
  if(numStr === "Error") return numStr;
  let [intPart, decPart] = numStr.split(".");
  let negative = intPart.startsWith("-");
  if(negative) intPart = intPart.slice(1);
  intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  let result = (negative? "-":"") + intPart + (decPart !== undefined ? "," + decPart : "");
  return result;
}

function updateDisplay(){
  displayEl.textContent = formatNumber(current);
  if(operator && previous !== null && !justEvaluated){
    exprEl.textContent = formatNumber(previous) + " " + operator;
  } else if(justEvaluated && lastExpr){
    exprEl.textContent = lastExpr + " =";
  } else {
    exprEl.textContent = "\u00A0";
  }
}

function inputDigit(d){
  if(justEvaluated){
    current = d;
    justEvaluated = false;
    return;
  }
  if(current === "0") current = d;
  else if(current.replace("-","").replace(".","").length < 14) current += d;
}

function inputDecimal(){
  if(justEvaluated){
    current = "0.";
    justEvaluated = false;
    return;
  }
  if(!current.includes(".")) current += ".";
}

function backspace(){
  if(justEvaluated){ clearAll(); return; }
  if(current.length <= 1 || (current.length === 2 && current.startsWith("-"))){
    current = "0";
  } else {
    current = current.slice(0, -1);
  }
}

function clearAll(){
  current = "0";
  previous = null;
  operator = null;
  justEvaluated = false;
  lastExpr = null;
}

function percent(){
  current = String(parseFloat(current) / 100);
}

function compute(a, b, op){
  a = parseFloat(a); b = parseFloat(b);
  switch(op){
    case "+": return a + b;
    case "−": return a - b;
    case "×": return a * b;
    case "÷": return b === 0 ? NaN : a / b;
  }
}

function setOperator(op){
  if(operator && previous !== null && !justEvaluated){
    const result = compute(previous, current, operator);
    previous = isNaN(result) ? "Error" : String(round(result));
    current = previous;
  } else {
    previous = current;
  }
  operator = op;
  justEvaluated = false;
  current = "0";
}

function round(n){
  return Math.round((n + Number.EPSILON) * 1e10) / 1e10;
}

function equals(){
  if(operator === null || previous === null) return;
  lastExpr = formatNumber(previous) + " " + operator + " " + formatNumber(current);
  const result = compute(previous, current, operator);
  current = isNaN(result) ? "Error" : String(round(result));
  previous = null;
  operator = null;
  justEvaluated = true;
}

document.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('click', () => {
    const action = btn.dataset.action;
    const value = btn.dataset.value;
    if(current === "Error" && action !== "clear") { clearAll(); }

    if(action === "digit") inputDigit(value);
    else if(action === "decimal") inputDecimal();
    else if(action === "operator") setOperator(value);
    else if(action === "equals") equals();
    else if(action === "clear") clearAll();
    else if(action === "backspace") backspace();
    else if(action === "percent") percent();

    updateDisplay();
  });
});

window.addEventListener('keydown', (e) => {
  if(e.key >= "0" && e.key <= "9") inputDigit(e.key);
  else if(e.key === ".") inputDecimal();
  else if(e.key === "+") setOperator("+");
  else if(e.key === "-") setOperator("−");
  else if(e.key === "*") setOperator("×");
  else if(e.key === "/") { e.preventDefault(); setOperator("÷"); }
  else if(e.key === "Enter" || e.key === "=") equals();
  else if(e.key === "Backspace") backspace();
  else if(e.key === "Escape") clearAll();
  else return;
  updateDisplay();
});

updateDisplay();