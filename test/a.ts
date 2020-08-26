///<reference path='b.ts'/>

const onTransitionEnd        = () => {};
const EventTransitionEndName = `click`;
document.removeEventListener((EventTransitionEndName as 'transitionend'), onTransitionEnd, false);

import(`b`);