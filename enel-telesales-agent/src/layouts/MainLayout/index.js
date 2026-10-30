export { default } from './MainLayout';

const UserIdleTimeoutMS = 60 * 60 * 1000;

function idleLogout(fn) {
    let t;
    window.onload = resetTimer;
    window.onmousemove = resetTimer;
    window.onmousedown = resetTimer;
    window.ontouchstart = resetTimer;
    window.onclick = resetTimer;
    window.onkeydown = resetTimer;
    window.addEventListener('scroll', resetTimer, true);

    function resetTimer() {
        clearTimeout(t);
        t = setTimeout(fn, UserIdleTimeoutMS);
    }
}

console.log(`you will be logged out after ${UserIdleTimeoutMS / 1000} seconds of inactivity`);
idleLogout(() => {
    localStorage.setItem('accessToken', '');
    window.location = '/login';
});
