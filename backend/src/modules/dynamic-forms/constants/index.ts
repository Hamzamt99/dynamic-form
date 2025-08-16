export const registerArray: any = [
  {
    type: 'normalStep',
    identifier: 'register_step_1',
    title: { locale: { en: 'Register', ar: 'تسجيل' } },
    childs: [
      {
        type: 'section',
        identifier: 'register_fields',
        childs: [
          {
            type: 'input',
            identifier: 'firstName',
            label: { locale: { en: 'First Name', ar: 'الاسم الأول' } },
            mandotory: true,
            input: { kind: 'text', placeholder: 'John' },
            validation: {
              required: true,
              minLength: 2,
              maxLength: 50,
              pattern: "^[\\p{L} .'’-]+$",
              patternFlags: "u",
              message: { locale: { en: 'Enter a valid name', ar: 'يرجى إدخال اسم صحيح' } }
            }
          },
          {
            type: 'listCellOptions',
            identifier: 'method',
            label: { locale: { en: 'Register by', ar: 'التسجيل بواسطة' } },
            mandotory: true,
            values: {
              options: [
                { id: 'email', label: 'Email' },
                { id: 'phone', label: 'Phone' }
              ]
            },
            showAsSelect: { enabled: false },
            validation: {
              required: true,
              message: { locale: { en: 'Choose a method', ar: 'يرجى اختيار الطريقة' } }
            }
          },
          {
            type: 'input',
            identifier: 'email',
            label: { locale: { en: 'Email', ar: 'البريد الإلكتروني' } },
            mandotory: true, 
            input: { kind: 'email', placeholder: 'you@example.com' },
            condition: { valueA: 'email', valueB: '{{values.method}}', comparator: '=', compareAs: 'string' },
            validation: {
              required: true,
              email: true,
              message: { locale: { en: 'Enter a valid email', ar: 'يرجى إدخال بريد إلكتروني صالح' } }
            }
          },
          {
            type: 'input',
            identifier: 'phone',
            label: { locale: { en: 'Phone', ar: 'الهاتف' } },
            mandotory: true,
            input: { kind: 'tel', placeholder: '+9627…' },
            condition: { valueA: 'phone', valueB: '{{values.method}}', comparator: '=', compareAs: 'string' },
            validation: {
              required: true,
              phone: true,
              pattern: "^\\+9627\\d{8}$",
              message: { locale: { en: 'Enter a valid Jordanian phone (+9627XXXXXXXX)', ar: 'أدخل رقم أردني صحيح (+9627XXXXXXXX)' } }
            }
          },
          {
            type: 'input',
            identifier: 'password',
            label: { locale: { en: 'Password', ar: 'كلمة المرور' } },
            mandotory: true,
            input: { kind: 'password', placeholder: '••••••••' },
            condition: { valueA: '{{values.method}}', valueB: 'email,phone', comparator: 'in', compareAs: 'string' },
            validation: {
              required: true,
              minLength: 8,
              maxLength: 64,
              pattern: "^(?=.*[A-Za-z])(?=.*\\d).{8,}$",
              message: { locale: { en: 'At least 8 chars, with letters & numbers', ar: '8 أحرف على الأقل وتحتوي على حروف وأرقام' } }
            }
          }
        ]
      },
    ],
    submit: { locale: { en: 'Continue', ar: 'متابعة' } },
    nextStep: 'register_step_2'
  },
  {
    type: 'normalStep',
    identifier: 'register_step_2',
    title: { locale: { en: 'Profile', ar: 'الملف' } },
    childs: [
      {
        type: 'section',
        identifier: 'profile_fields',
        mandotory:false,
        childs: [
          {
            type: 'textLabel',
            identifier: 'hint',
            text: { locale: { en: 'Anything to test the validation it should go home even if its empty since the field mandotory false ', ar: 'املأ بياناتك' } },
            input: { kind: 'text', placeholder: 'Anything to test the validation it should go home even if its empty since the field mandotory false' },
          }
        ]
      }
    ],
    prevStep: 'register_step_1',
    nextStep: null
  }
];


export const loginArray: any = [
  {
    type: 'normalStep',
    identifier: 'login_step',
    title: { locale: { en: 'Login', ar: 'تسجيل الدخول' } },
    childs: [
      {
        type: 'section',
        identifier: 'login_fields',
        childs: [
          {
            type: 'listCellOptions',
            identifier: 'method',
            label: { locale: { en: 'Method', ar: 'الطريقة' } },
            mandotory: true,
            values: { source: 'login_methods' },
            showAsSelect: { enabled: false },
            validation: {
              required: true,
              message: { locale: { en: 'Choose a method', ar: 'يرجى اختيار الطريقة' } }
            }
          },
          {
            type: 'input',
            identifier: 'email',
            label: { locale: { en: 'Email', ar: 'البريد الإلكتروني' } },
            mandotory: true,
            input: { kind: 'email', placeholder: 'you@example.com' },
            condition: { valueA: '{{values.method}}', valueB: 'email', comparator: '=' },
            validation: {
              required: true,
              email: true,
              message: { locale: { en: 'Enter a valid email', ar: 'يرجى إدخال بريد إلكتروني صالح' } }
            }
          },
          {
            type: 'input',
            identifier: 'phone',
            label: { locale: { en: 'Phone', ar: 'الهاتف' } },
            mandotory: true,
            input: { kind: 'tel', placeholder: '+9627...' },
            condition: { valueA: '{{values.method}}', valueB: 'phone', comparator: '=' },
            validation: {
              required: true,
              phone: true,
              pattern: "^\\+9627\\d{8}$",
              message: { locale: { en: 'Enter a valid Jordanian phone (+9627XXXXXXXX)', ar: 'أدخل رقم أردني صحيح (+9627XXXXXXXX)' } }
            }
          },
          {
            type: 'input',
            identifier: 'username',
            label: { locale: { en: 'Username', ar: 'اسم المستخدم' } },
            mandotory: true,
            input: { kind: 'text', placeholder: 'john_doe' },
            condition: { valueA: '{{values.method}}', valueB: 'username', comparator: '=' },
            validation: {
              required: true,
              minLength: 3,
              maxLength: 32,
              pattern: "^[a-zA-Z0-9_\\.]+$",
              message: { locale: { en: '3–32 letters, digits, _ or .', ar: '3–32 حروف/أرقام/_ أو .' } }
            }
          },
          {
            type: 'input',
            identifier: 'password',
            label: { locale: { en: 'Password', ar: 'كلمة المرور' } },
            mandotory: true,
            input: { kind: 'password', placeholder: '••••••••' },
            condition: { valueA: '{{values.method}}', valueB: 'email,phone,username', comparator: 'in', compareAs: 'string' },
            validation: {
              required: true,
              minLength: 8,
              maxLength: 64,
              pattern: "^(?=.*[A-Za-z])(?=.*\\d).{8,}$",
              message: { locale: { en: 'At least 8 chars, with letters & numbers', ar: '8 أحرف على الأقل وتحتوي على حروف وأرقام' } }
            }
          }
        ]
      }
    ],
    nextStep: null
  }
];


// export const postArray: any = [
//   {
//     type: 'normalStep',
//     identifier: 'post_mediaStepIdentifier',
//     title: { locale: { en: 'Add pictures to your listing', ar: 'اضف صور للاعلان' } },
//     childs: [
//       {
//         type: 'section',
//         identifier: 'mediaMegaSectionIdentifier',
//         childs: [
//           {
//             type: 'textLabel',
//             identifier: 'mediaStepLabelIdentifier',
//             text: { parse_as: 'html', locale: { en: 'You can add up to <strong>30</strong> pictures' } }
//           },
//           {
//             type: 'section',
//             identifier: 'mediaStepIdentifier',
//             childs: [
//               {
//                 type: 'mediaSection',
//                 identifier: 'postMedia',
//                 mandotory: true,
//                 config: { numberOfImages: 30, minNumberOfImages: 3 },
//                 label: { locale: { en: 'Photos', ar: 'صور' } },
//                 validation: {
//                   required: true,
//                   min: 3,
//                   max: 30,
//                   message: { locale: { en: 'Add 3–30 photos', ar: 'أضف من 3 إلى 30 صورة' } }
//                 }
//               }
//             ]
//           }
//         ]
//       }
//     ],
//     nextStep: 'post_reelStepIdentifier'
//   },
//   {
//     type: 'normalStep',
//     identifier: 'post_reelStepIdentifier',
//     title: { locale: { en: 'Add a video reel to your listing', ar: 'أضف فيديو' } },
//     childs: [
//       {
//         type: 'section',
//         identifier: 'reelMegaSectionIdentifier',
//         childs: [
//           {
//             type: 'videoSection',
//             identifier: 'postVideo',
//             mandotory: false, // optional; won’t block Next
//             config: { numberOfReels: 1, reelsMaximumDuration: 30 },
//             label: { locale: { en: 'Reels', ar: 'ريلز' } },
//             validation: {
//               required: false,
//               max: 1,
//               message: { locale: { en: 'Max 1 reel, 30s', ar: 'بحد أقصى ريل واحد، 30 ثانية' } }
//             }
//           }
//         ]
//       }
//     ],
//     nextStep: 'post_previewStep'
//   },
//   {
//     type: 'previewStep',
//     identifier: 'post_previewStep',
//     title: { locale: { en: 'Listing details', ar: 'تفاصيل الإعلان' } },
//     nextStep: null
//   }
// ];
