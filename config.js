// إعدادات الواجهة. كلها اختيارية ما عدا الخادم نفسه.
window.APP_CONFIG = {
  // لو الواجهة والخادم على نفس العنوان اتركها فارغة
  apiBase: '',

  // الصق هنا إعدادات Firebase (Project settings > Your apps > Web app).
  // لو تركتها null: المفردات تتخزن على الجهاز، وملفات PDF تترفع على الخادم.
  firebase: null
  /* مثال:
  firebase: {
    apiKey: '...',
    authDomain: '...firebaseapp.com',
    projectId: '...',
    storageBucket: '...appspot.com',
    messagingSenderId: '...',
    appId: '...'
  }
  */
};
