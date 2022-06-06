import "./styles.css";
import React from "react";
import ReactDOM from "react-dom";
import { createMachine, assign } from "xstate";
import { useMachine } from "@xstate/react";
import logic from "./logic";

const questions = {
  one: {
    message: "First question?",
    next: { true: "two", false: "three" },
    rule: { if: [{ "==": [{ var: "answer" }, true] }, "two", "three"] },
  },
  two: {
    message: "Second question?",
    next: { true: "three", false: "four" },
    rule: { if: [{ "==": [{ var: "answer" }, false] }, "three", "four"] },
  },
  three: {
    message: "Third question?",
    next: { true: "four" },
    rule: { if: [{ "==": [{ var: "answer" }, true] }, "four", "four"] },
  },
  four: {
    message: "Fourth question?",
    next: { true: "" },
    rule: { if: [{ "==": [{ var: "answer" }, true] }, "one", "two"] },
  },
};

const questionsMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEcCucAuBLA9gO1gDoB3MAGwGMcBbMAYgDkBRADQBVFQAHHWLbfJxAAPRAFoATAHYALIQDMEiQEYJAVgkAGABwA2CQE4JAGhABPRMt2Fta3WuUHt8+TI1S1AX0+m0mXASEfrACeIysHEggPHyhQqIIkmrahFZOmo7KUrryUqYWibpSCprJ2doSrmoGBt6+6CEBRMGhdABCAIIAwgDSQjH8AfHiynoKrjm6yrlqbpry+eJKmoRTmgYyLjUO61J1IC1NQQ2tAMoAqm0AsgCSkdy8g4JRCVIShE7yujJSX1KjmhkMkWiWUMgMqWUOg2FVUEl0tX2eBwEDgQkO+CIpEoNDA-UecRe4nkamKmik2my9gM9l0emB5kQlVWajUil0U1cmkBpX2GMC-PxsSGRNBuUI8I0ymUrLB3w0IIkKXk2gMpW0zgR0rBex8BxORwATmAAG5YMDEIVPPDDBDS976H7g3SlGR0mWK+QstnSnK-apaLx6-nwKIDQmgBJiFXKQjkykc6q0+kgyQGL1rdMUqxApXebxAA */
  createMachine({
    context: {
      questions,
      question: "one",
      // answers: [],

      // history stack
      stack: [],
    },
    id: "questions",
    initial: "welcome",
    states: {
      welcome: {
        on: {
          NEXT: {
            target: "question",
          },
        },
      },
      question: {
        on: {
          NEXT: {
            actions: assign({
              // answers: (ctx, e) => ctx.answers.concat(cxt.question, e.answer),
              question: (ctx, e) => choseNextQuestion(ctx, e.answer),
              stack: (ctx) => ctx.stack.concat(ctx.question),               
            }),
            alert: (ctx) => {console.log(ctx.stack)},
          },
          BACK: {
            actions: assign((ctx) => {
              const { stack } = ctx;
              const newStack = stack.slice(0, stack.length - 1);
              const prev = stack[stack.length - 1];

              return {
                question: prev,
                stack: newStack,
              };
            }),
            cond: (ctx) => ctx.stack.length > 0,
          },
          SUBMIT: {
            cond: (ctx) => !ctx.questions[ctx.question].next.length,
            target: "review",
          },
        },
      },
      review: {},
    },
  });

function choseNextQuestion(ctx, response) {
  const questionData = ctx.question ? ctx.questions[ctx.question] : undefined;
  let answerData = {answer : parseBoolean(response)}
  console.log(answerData);
  const nextQuestion = logic.apply(questionData.rule, answerData);

  const check = nextQuestion ? nextQuestion : "four";
  return check;
}

function parseBoolean(value) {
  value = value?.toString().toLowerCase();
  return value === 'true' || value === '1';
}

function App() {
  const [state, send] = useMachine(questionsMachine);
  const { question } = state.context;

  const questionData = question ? state.context.questions[question] : undefined;
  return (
    <div className="App">
      {state.matches("welcome") ? (
        <>
          <h2>Welcome!</h2>
          {state.nextEvents.map((event) => {
            return (
              <button onClick={(_) => send(event)} key={event}>
                {event}
              </button>
            );
          })}
        </>
      ) : state.matches("question") ? (
        <>
          <h2>{questionData.message}</h2>
          <button
            onClick={(_) => send({ type: "NEXT", answer: "true" })}
            key={true}
          >
            TRUE
          </button>
          <button
            onClick={(_) => send({ type: "NEXT", answer: "false" })}
            key={false}
          >
            FALSE
          </button>
          <button className="back" onClick={(_) => send("BACK")}>
            Go Back
          </button>
        </>
      ) : null}
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
