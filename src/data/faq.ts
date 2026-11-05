// The six questions, shared by the FAQ section and its FAQPage structured data.
export const faqs = [
  {
    q: 'What does Auctervia actually do?',
    a: 'It sits between your agents and the tools they call. Every action is checked against your policy before it runs, allowed or denied, and written down as a sealed record of what was tried, what was decided and what actually happened.',
  },
  {
    q: 'Do we have to rebuild our agents?',
    a: 'No. An MCP server or an SDK adapter puts your existing agents behind the gateway with minimal code changes. Your models, prompts and tools stay as they are.',
  },
  {
    q: 'Which models and agent stacks does it work with?',
    a: 'Agents built on Claude, OpenAI, Gemini and open-weight models, including self-hosted ones. The checks happen at the tool call, so the model underneath does not matter.',
  },
  {
    q: 'What happens when an action is denied?',
    a: 'It never reaches the tool. The agent gets a clear refusal it can act on, and the attempt is recorded with the policy that blocked it, so the decision can be reviewed later.',
  },
  {
    q: 'Who can verify the evidence?',
    a: 'Anyone you share it with. Records are hash-linked and append-only, kept separate for each customer, and exported in an open format, so security teams, auditors and certifiers can check them without us.',
  },
  {
    q: 'How does a pilot work?',
    a: 'Four weeks, one workflow, one policy. We put the agent behind the gateway, run the test suite against it and finish with a versioned evidence report and a release decision your security team can sign.',
  },
];
