export const data = {
  type: 'text',
  channel: 'web',
  direction: 'incoming',
  payload: {
    type: 'text',
    text: 'yes'
  },
  target: '53afb80a-7da5-4062-8911-4c9902571c48',
  botId: 'john-appleseed',
  createdOn: '2021-11-25T02:35:45.708Z',
  threadId: 'b8493c5f-9e2f-446d-809e-8170424330ed',
  id: '34288315116291163',
  preview: 'yes',
  flags: {},
  state: {
    __stacktrace: [
      {
        flow: 'Genius-Bar.flow.json',
        node: 'choose_acare'
      },
      {
        flow: 'Genius-Bar.flow.json',
        node: 'write_acare'
      },
      {
        flow: 'Genius-Bar.flow.json',
        node: 'get_ticket_no'
      },
      {
        flow: 'Genius-Bar.flow.json',
        node: 'print_ticket'
      },
      {
        flow: 'main.flow.json',
        node: 'entry'
      },
      {
        flow: 'main.flow.json',
        node: 'main_intent-copy'
      }
    ],
    user: {
      timezone: -7,
      language: 'en'
    },
    context: {
      currentFlow: 'main.flow.json',
      currentNode: 'main_intent-copy',
      previousFlow: 'conversation_end.flow.json',
      previousNode: 'entry',
      jumpPoints: [
        {
          flow: 'main.flow.json',
          node: 'main_intent-copy'
        },
        {
          flow: 'Genius-Bar.flow.json',
          node: 'print_ticket'
        },
        {
          flow: 'conversation_end.flow.json',
          node: 'entry'
        }
      ],
      queue: {
        instructions: [
          {
            type: 'transition',
            fn: "event.nlu.intent.name === 'genius-bar'",
            node: 'Genius-Bar.flow.json'
          },
          {
            type: 'transition',
            fn: "event.nlu.intent.name === 'apple-news'",
            node: 'Apple-news.flow.json'
          },
          {
            type: 'transition',
            fn: "event.nlu.intent.name === 'none'",
            node: 'no_intent'
          }
        ]
      }
    },
    session: {
      lastMessages: [
        {
          eventId: '34257565832666167',
          incomingPreview: 'hello',
          replyConfidence: 1,
          replySource: 'dialogManager',
          replyDate: '2021-11-25T02:35:21.129Z',
          replyPreview: '#!builtin_text-XiwUrG'
        },
        {
          eventId: '34272914594125298',
          incomingPreview: 'nick',
          replyConfidence: 1,
          replySource: 'dialogManager',
          replyDate: '2021-11-25T02:35:30.874Z',
          replyPreview: '#!builtin_text-58i3EP'
        },
        {
          eventId: '34284319709250008',
          incomingPreview: 'iphone repair',
          replyConfidence: 1,
          replySource: 'dialogManager',
          replyDate: '2021-11-25T02:35:42.717Z',
          replyPreview: '#!builtin_single-choice-9i8Z1x'
        },
        {
          eventId: '34288315116291163',
          incomingPreview: 'yes',
          replyConfidence: 1,
          replySource: 'dialogManager',
          replyDate: '2021-11-25T02:35:46.277Z',
          replyPreview: '#!builtin_text-A8TO2T'
        },
        {
          eventId: '34288315116291163',
          incomingPreview: 'yes',
          replyConfidence: 1,
          replySource: 'dialogManager',
          replyDate: '2021-11-25T02:35:46.295Z',
          replyPreview: '#!builtin_text-XYqks8'
        }
      ],
      workflows: {},
      slots: {
        notFound: 0,
        device: {
          confidence: 0.8797567890205352,
          start: 0,
          end: 6,
          entity: {
            name: 'devices',
            type: 'custom.list.devices',
            meta: {
              confidence: 1,
              start: 0,
              end: 6,
              sensitive: false,
              source: 'iphone'
            },
            data: {
              unit: '',
              value: 'iphone'
            }
          },
          name: 'device',
          source: 'iphone',
          value: 'iphone',
          timestamp: 1637807742700,
          turns: 1,
          overwritable: true,
          expiresAfterTurns: false
        },
        service: {
          confidence: 0.9957873853405363,
          start: 7,
          end: 13,
          entity: {
            name: 'services',
            type: 'custom.list.services',
            meta: {
              confidence: 1,
              start: 7,
              end: 13,
              sensitive: false,
              source: 'repair'
            },
            data: {
              unit: '',
              value: 'repair'
            }
          },
          name: 'service',
          source: 'repair',
          value: 'repair',
          timestamp: 1637807742700,
          turns: 1,
          overwritable: true,
          expiresAfterTurns: false
        }
      },
      welcome: '1',
      usename: 'nick'
    },
    temp: {
      alreadyExtracted: '"false"',
      'skill-choice-valid-kzsxlbvt9d': true,
      'skill-choice-ret-kzsxlbvt9d': 'yes',
      ticket: 29640
    }
  },
  messageId: '45f8231e-e9ba-4414-a50e-e8a9437092b0',
  suggestions: [],
  nlu: {
    entities: [],
    language: 'en',
    detectedLanguage: 'en',
    spellChecked: 'yes',
    ambiguous: true,
    slots: {},
    intent: {
      name: 'none',
      confidence: 0.586007303493025,
      context: 'global'
    },
    intents: [
      {
        name: 'none',
        context: 'global',
        confidence: 0.586007303493025
      },
      {
        name: 'apple-news',
        context: 'global',
        confidence: 0.41399269650697496
      }
    ],
    errored: false,
    includedContexts: ['global'],
    ms: 509,
    predictions: {
      global: {
        confidence: 1,
        oos: 0.5321269444689732,
        intents: [
          {
            label: 'apple-news',
            confidence: 0.3759281963067712,
            extractor: 'svm-classifier',
            slots: {}
          },
          {
            label: 'genius-bar',
            confidence: 0.09194485922425558,
            extractor: 'svm-classifier',
            slots: {}
          }
        ]
      }
    }
  },
  processing: {
    received: {
      date: '2021-11-25T02:35:45.709Z'
    },
    stateLoaded: {
      date: '2021-11-25T02:35:45.715Z'
    },
    'hook:apply_nlu_contexts:completed': {
      date: '2021-11-25T02:35:45.717Z'
    },
    'mw:hitlnext.incoming:completed': {
      date: '2021-11-25T02:35:45.718Z'
    },
    'mw:nlu-predict.incoming:completed': {
      date: '2021-11-25T02:35:46.232Z'
    },
    'mw:qna.incoming:completed': {
      date: '2021-11-25T02:35:46.232Z'
    },
    'mw:analytics.incoming:completed': {
      date: '2021-11-25T02:35:46.233Z'
    },
    'mw:converse.capture.context:skipped': {
      date: '2021-11-25T02:35:46.233Z'
    },
    'hook:00_dialog_engine:completed': {
      date: '2021-11-25T02:35:46.237Z'
    },
    'hook:00_misunderstood_flag:completed': {
      date: '2021-11-25T02:35:46.244Z'
    },
    'hook:01_expire_nlu_contexts:completed': {
      date: '2021-11-25T02:35:46.246Z'
    },
    'hook:05_extract_slots:completed': {
      date: '2021-11-25T02:35:46.248Z'
    },
    'dialog:start': {
      date: '2021-11-25T02:35:46.250Z'
    },
    'action:basic-skills/choice_parse_answer:completed': {
      date: '2021-11-25T02:35:46.256Z'
    },
    'action:builtin/setVariable:completed': {
      date: '2021-11-25T02:35:46.263Z'
    },
    'action:random:completed': {
      date: '2021-11-25T02:35:46.268Z'
    },
    completed: {
      date: '2021-11-25T02:35:46.424Z'
    }
  },
  activeProcessing: {},
  decision: {
    decision: {
      reason: 'no suggestion matched',
      status: 'elected'
    },
    confidence: 1,
    payloads: [],
    source: 'decisionEngine',
    sourceDetails: 'execute default flow'
  }
}
