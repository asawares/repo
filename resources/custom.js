function AddHud() {
    let hudStyleElement;
    let loadingNotification;
    function showLoadingNotification() {
        if (document.getElementById('loadingNotification')) return;
        loadingNotification = document.createElement('div');
        loadingNotification.id = 'loadingNotification';
        loadingNotification.style.position = 'fixed';
        loadingNotification.style.bottom = '10%';
        loadingNotification.style.left = '50%';
        loadingNotification.style.transform = 'translateX(-50%)';
        loadingNotification.style.display = 'flex';
        loadingNotification.style.alignItems = 'center';
        loadingNotification.style.padding = '10px 20px';
        loadingNotification.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        loadingNotification.style.color = '#fff';
        loadingNotification.style.fontFamily = 'Arial, sans-serif';
        loadingNotification.style.fontSize = '16px';
        loadingNotification.style.borderRadius = '8px';
        loadingNotification.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
        loadingNotification.style.opacity = '0';
        loadingNotification.style.transition = 'opacity 2.5s';
        loadingNotification.style.zIndex = '1000';
        const spinner = document.createElement('div');
        spinner.style.width = '20px';
        spinner.style.height = '20px';
        spinner.style.border = '3px solid rgba(255, 255, 255, 0.3)';
        spinner.style.borderTop = '3px solid #fff';
        spinner.style.borderRadius = '50%';
        spinner.style.marginRight = '10px';
        spinner.style.animation = 'spin 1s linear infinite';
        const text = document.createElement('span');
        text.textContent = 't.me/limitmods';
        loadingNotification.appendChild(spinner);
        loadingNotification.appendChild(text);
        document.body.appendChild(loadingNotification);
        const loadingStyle = document.createElement('style');
        loadingStyle.textContent = `
            @keyframes spin {
                0% {
                    transform: rotate(0deg);
                }
                100% {
                    transform: rotate(360deg);
                }
            }
        `;
        document.head.appendChild(loadingStyle);
        setTimeout(() => {
            loadingNotification.style.opacity = '1';
        }, 10);
    }
    showLoadingNotification();
    window.mazzx = window.mazzx || {};
    function formatNumberWithDots(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
    let notificationContainer;
    function createContainer() {
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'mazzxNotificationContainer';
            notificationContainer.style.position = 'fixed';
            notificationContainer.style.bottom = '14%';
            notificationContainer.style.left = '50%';
            notificationContainer.style.transform = 'translateX(-50%)';
            notificationContainer.style.zIndex = '1000';
            notificationContainer.style.display = 'flex';
            notificationContainer.style.flexDirection = 'column';
            notificationContainer.style.alignItems = 'center';
            document.body.appendChild(notificationContainer);
        }
    }
    mazzx.addLabel = function (message) {
        createContainer();
        const notification = document.createElement('div');
        notification.className = 'mazzx-notification';
        notification.style.position = 'relative';
        notification.style.padding = '10px 20px';
        notification.style.marginBottom = '10px';
        notification.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        notification.style.color = '#fff';
        notification.style.fontFamily = 'Arial, sans-serif';
        notification.style.fontSize = '16px';
        notification.style.borderRadius = '8px';
        notification.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 2.5s';
        notification.style.display = 'flex';
        notification.style.justifyContent = 'center';
        notification.style.alignItems = 'center';
        const icon = document.createElement('img');
        icon.src = 'https://i.imgur.com/rBjM3OW.png';
        icon.style.width = '20px';
        icon.style.height = '20px';
        icon.style.marginRight = '10px';
        const text = document.createElement('span');
        text.textContent = message;
        notification.appendChild(icon);
        notification.appendChild(text);
        notificationContainer.appendChild(notification);
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification) {
                    notification.remove();
                }
                if (notificationContainer && notificationContainer.children.length === 0) {
                    notificationContainer.remove();
                    notificationContainer = null;
                }
            }, 2500);
        }, 6000);
    };
    mazzx.addLabel("")
    const hudScript = document.currentScript;
    const hudElements = [];
const oldRadmirConfig = {
    icons: {
        "active_wanted": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAdCAYAAABbjRdIAAAB70lEQVR4nOyWPWsUURSGn9mdXfxqxEJBERtBsBBFsRLERhsr8QdoZ2dpaeUfELQXQbAQLMVfIDYq2KkorCEfBLLkY5Pszt5wwnvDZXJnMjNZtgg5cLiwZ+555rz33DObOueYlrWmRpo2LN3H3kRu5uSl1qSyRPuuA/+A91XzJDUbxEBt4DjQA07o97PAHDAuq7BOZYlk7wAfApAlv61YO5C2EcxDuvKnwJ1c/GEQ7xTljTVIK0jiZUvl14AXkT2XgPPAfz1vOUZAFsqaPzOf3PwucAO4AFxUsjMlMi0K9hv4C/wE3gHrOkswWOAG7zrnXrnJ2C3l2y4qpq39dqXg7evYKvAjbJo8zGv6RFI0tS/AZUEyL2OsMjvYGeAZsNwA9AZ4DGwAA2DTB2IwfzG/Ay9rQGzPc+C1mqIvIGUwp9I70nytIuwz8FXK9AVkLxjS2mD3gWMVYT01w0AvuGtsxWBJMAkeVASZLegIrKJh7IEYLFU1N4EjkXhWAszyUyOfOA+3iX4UeJSLzQKftNpsvBrsH6nrxspRCdYOJOxK+1/AR61+IL/VXboHnAPmgW/Akq5LFBb7nhnoJHBKia19VzQRhkHcZuZpVWXfsj9ao+dVBNuJaS16wEue6GXGRYmqwCZuB/ev3CFsIrYVAAD//9Ov1ZXE2UQ9AAAAAElFTkSuQmCC",
        "armour": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA6UlEQVR4nOxSsU6FQBCcvOMRzmswSkVJ7PgGv8zCb7PkF4wlVhoIMS6BYMzgrdHjArF3ks2FudnZZfeSu/s3C+ASAE9CAHT+/ImoLiH5+vLYZjZf2VF6XF3flBGDqI4GlqRzxXphTmceZdAFq5bUqIHyp6AKzukFhqFtANQAKh81Od6FSELCmHTtZpS+WT7m767I8e7QQE2M3Ypj4C8IB8JYlukwgRrVM5cddH7q1Sj9w1HleXrnIG8zmz/pGsWH1X/e7eBL8+wDmy38Ff8Gvx+S+N3ughrnCokZ6HuwewY+udPvzwAAAP//mNRa7K5mABoAAAAASUVORK5CYII=",
        "breath": "data:image/png;base64,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",
        "cash": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAbCAYAAACN1PRVAAAFE0lEQVR4nLxWbYhVVRd+1t777DPn7L3PvdcZ9H1f3vctqVDT8iM/in5ERmCJ1h/zR5kRpZRBKFGh0OevIvoRJRFFBkaMaRoUWJKZFWlpKZaK0adkY441zDl3btM995xY07ly8161X7Nhcz72x7PWs5619lZ5nmO0mhg1JACq+eKcaxv0PA/1er0yNDT0eJZls4nol66urqe6urp2NBoNZFn2j0DiOB55UpPGVjCl/rIhSZKH0jR9hOe1Liaid40xt3qedzxNU5wrFE2wv9EohBjxplarLRwYGOhP03SN1nqBc4746fv+LGPMJACVJEn6BgcHnyGiU8ads7FV3CuVCqy1/xZCrAPQL6VcWy6X+V9Jaz2fPe/u7h7pPT09MMZMJqJPAQxore/g9cX8tt7EOPXied4SAMOMT0Sf82LuUsqHAVR9378+CIJ5Qoi1RPQxP7XWi7XWywD8BuBIGIZzeA0bdlYwAO8zUAG2p7moWDiGiLa1jO+WUm4koo+EEM865yIhxAYeE0Js5u+CqTOC7ZFSrldKrQHwk1LqQaZl7Nix7N19BchbvBn/D4JgUUF5LqVcNW7cOP43k4j2AzistV7O87h3AtsO4PswDK8Iw/BqAD8A6AvD8BrnnAFwgq3XWt+vlFrd9JJF65wbw55EUTSyOYDvCuM+C4JgViewbUT0BYCvhRAbWQBa63t4MyFEbxAEVymlHuN4FiB9UsrnPM9bLoTYopS6i4GccxrAjy3GbG1itEq/m4j6oyiaQ0RHq9XqnizLKtbaaSyQWq3WS0SDpVJpRqVSIefcv8rl8gqt9ZtZlv2XiOqcAlmWjQfQBWC/EILZMm3SB/AGgBqAo1rrm621FxPRO+yB1vomY8xlRLQTwEmt9dJWAXEq8LcQ4jXekuMeRZETQrwNYG8nGr9SSq2z1k4oON9vjJkZhuFcjh/zz99BENwA4Oei9zHNRLSLvSeiD621E4MgWFiMNQC83glsUyHdXufceVrrO7nSsLXOuQu11ncDGBRCvGytneR53upmXnIR8H1/gTFmKhF9wkBsmFLqJQAHOsVslpRygxDiQBzHR/I873bOXUREJ+M4Ppjnedk5NwXAH0mS7CWiPs/z2IBDURRdUK/XF1Sr1X1KqU1RFE2r1Wor0jS9nQXXFjMieoUtDYLgRmvtJUT0HoBjTJu1lkvTDs6/Ynw6U1Z4daxQ7Hrn3PkFA7GU8kkpJXu2u41Glq3W+jbmmWueMebSIAiuYwAuTyyY4ruPqXLO/d/zvHt54zAMObZXAviGU8MYM6OY288p1QbGZaVITCGEeKGI34vOufGe561kAUgpn3fO/c/zvFUAfgVwkIi+JKLNAI77vr/YWjuFiFjyB4UQHwDY2SlmfFDyz6xUKi0zxozP83xKHMffcg455ybmeR5yPIno9yiKJgghWNaThRCHnXPT0zSdnSTJPinljnK5PDvP8x4A/2mL2enHApce9tT3/fmFjI8GQXBtkW98tOyVUj7NKaO1voU9JaIt1lpW7lIWEntYGN1OY6feLKZKqQeKeredc8n3/UVFrrFIjhhjLjfGzCnUl/Dx06yXHWns1PjY5+6ce8I5Z1nySZIcajQanGuPEtEha+28Wq22slqt7pJSsvRtGIa9HJbWe0rHO8iZWvMKMDw8PHloaOhVAFNbxrYW95ITp99LznrhOVdjQAaO43hJmqZzuRgbY7ac6cbVBjYabVQvqX8GAAD//1IbU0IZuRE7AAAAAElFTkSuQmCC",
        "circle": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAKCAYAAABmBXS+AAAAnklEQVR4nISPMQrCQBQF34qlYJcmRXoLzyBYWKi9ncfzArmARe5hqkCQKNi47IeRD0mhGB3Y6g3L/KmkiSTVdT3P83wfQiiApuu6MsuyVj3BzHbAlXceZnb0XTHGJRD5jqWU1gJOI8LAOQAXSYXGSR7ND8HBpeqPVHnTAniOhQMrl/xtgPZDuAMH3z18+HYmadsf0UgqJd18eAUAAP//IZG88q0ZEVAAAAAASUVORK5CYII=",
        "health": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABrUlEQVR4nKRSu27UQBQ9dzxjb1g5BiRIKFKAFEGTBgnBP9C54yOggQ7+IQ3iE0hBAR+AaBFSBA3bRUqTZpcICRutHzszF81MHLzeNKs9hTVzPefc15GznxOIKAIzg4RAkl3H8bu3R+eTyVP0cPP+g8+Pnr/I26IAWwsigjUako2BBbxIDzsAUixjpzsEsoHjChD5gwu4HxcosIpimazdBdKV7cHs2xCR0yReoRNxaNUCbEEXFcskyzq+V4+3MwilqiE/UqqO0xRm0YItoyuWvrx+cwTgWriBI6Xw5/T0cVMUu32BOE1n2d17X63WLlvX65w+5PlquWvADaDcgF+KTbJ3FQz3vQ5SeWN//xOArS5CUvLfs7OHbVne7r9U4/F5urd3zMZQL1zR75MTP34gzHK8ewffDg/fT398f9YXuHVw8PHJy1f5/NcsrFGQ371syzBD52852oKuatjFYjSs1Wqd6LqBaVroao7OgMIR3W6FVM5A3tbMloYCbJn+v4s9xyd1nyhOECWjSzsD2L5iYCHG7N87mKaGDOTE+5txmXh6hT+mgc9LIv8CAAD//yyAxEM8kvCgAAAAAElFTkSuQmCC",
        "hunger": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAZCAMAAAAGyf7hAAABy1BMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAfHx8wMDAHBwcAAAAAAACTk5P///8cHBwAAAAAAAAdHR0+Pj4EBAQAAAAAAAACAgJHR0dWVlYrKysAAAAICAgNDQ0AAAAAAACampr7+/vi4uLg4ODq6ur9/f08PDwHBweVlZWMjIwAAAAAAAAlJSWRkZETExMAAAB5eXn5+fmPj4+cnJz+/v6Hh4cAAABWVlagoKCioqKKiooICAimpqa0tLQFBQVwcHC2trYLCwsAAAAAAAAKCgrh4eHd3d1QUFAnJycQEBBxcXG9vb0MDAwAAAAAAAAHBwenp6fw8PAiIiIDAwNXV1f6+vrm5uYWFhYAAAAAAAAVFRW5ubmxsbGzs7Px8fHl5eUsLCwAAAAAAAACAgL4+PgAAAAAAACysrL09PTw8PBiYmIAAAAAAAD39/dtbW0lJSUjIyMFBQUAAACEhIQAAAAAAAAAAAD8/PyKiooCAgKPj48EBAQAAACqcwnDAAAAmXRSTlMAATuNlFdc3aBnfuclUPZRD9S+AxTSli3jF0qxTMgGExCpUuL8+/5q1v3//lWq/v39g2X//v7+/v38G+v+/v7+/f/9//395oD9/f7//f/9/f/93v38/Pz+/f3//f3+B5j+/v79/f79/f6RqP39//7+/f/+/q8M/v38/P7+/rMO/v7qGf3+/v3oMf/9//7tQ/35ilT//fb29nMpEXnVAAABMUlEQVR4nGLABRhBBBMznAlmsLAyMDCwsYOYHJwwUS5uHqggLx8/TFBAUEgYLCgiKoYwVFxCkkFKmoFBRlYOySp5qOkKOB0DAopCqEAJJKisoooM1NRBghqaWshAWwckqKunjwwMDI3kGBiMjE1MEcDM3MLSkIHBytpGy9bO3t7eQUtLy9HJ2cXVjYGBwd3D08sbBHx8tfyM/QMCQR5WCDIODgkNDQ0Lj4iMig6IieVkYIiLT4jU0nJMTEpKTklN00rPyGRgYMjKztHS0srNU1PL9y4oLCouKWVg4CiLBDmvsLyioqKyqrqmto6BgaG+PADh8gb9xiaQ25tBDmmBgNa29g5weGhpaXV2dUNAT28fA1QwoH8Cy0QImAQNOa3JU6ayogen1rTpM9DFAAEAAP//bKdOsRoVVIsAAAAASUVORK5CYII=",
        "inactive_wanted": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAARCAYAAAA/mJfHAAAAI0lEQVR4nGL5//8/A7UAE9VMGjVs1LBRw0YNG1jDAAEAAP//rfEDIrI5JIcAAAAASUVORK5CYII=",
        "wanted_back": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACMAAAAjCAYAAAAe2bNZAAAARElEQVR4nOzOoRGAQBAAMYah/5YP+2b1n0gqyDczzxbv7cBJpsgUmSJTZIpMkSkyRabIFJkiU2SKTJEpMmVV5g8AAP//iIYDRnB9EZkAAAAASUVORK5CYII=",
        "weapon_back": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAyCAYAAACqNX6+AAAAlElEQVR4nOzRMQ0AIBDAQELwb/mZUUCHOwVNemZm0bF/B/AyJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIm5AQAA//+ZAgNkzOjp8gAAAABJRU5ErkJggg==",
        "zone": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAyCAYAAACqNX6+AAAAlElEQVR4nOzRMQ0AIBDAQELwb/mZUUCHOwVNemZm0bF/B/AyJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIkxJMaQGENiDIm5AQAA//+ZAgNkzOjp8gAAAABJRU5ErkJggg=="
    },
    weapon: {
        "0": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAC0CAYAAAC69XpYAAAACXBIWXMAAAsTAAALEwEAmpwYAAAW12lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNy4yLWMwMDAgMTE2LmRlZTNhNzcsIDIwMjIvMDkvMDEtMTM6NTc6MDggICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIiB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iIHhtbG5zOmV4aWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vZXhpZi8xLjAvIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCAyMy41IChXaW5kb3dzKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjUtMDgtMDVUMjA6MTg6NDYrMDM6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDI1LTA4LTA5VDIzOjQ3OjQwKzAzOjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDI1LTA4LTA5VDIzOjQ3OjQwKzAzOjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpiOGMzYmY4NS1kMjkxLWYxNDYtODIyOC05ZWQ4YWRiOTYzOTEiIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDo5MTNhMjY1OC0yYThjLTY3NDUtOTAxMS1iZWFjZDViYTZhYzQiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpjMGY0MzlhNy01ZWI5LTNhNGQtODUyNS1hYTdmZmQ4ZWM3YzQiIHRpZmY6T3JpZW50YXRpb249IjEiIHRpZmY6WFJlc29sdXRpb249IjcyMDAwMC8xMDAwMCIgdGlmZjpZUmVzb2x1dGlvbj0iNzIwMDAwLzEwMDAwIiB0aWZmOlJlc29sdXRpb25Vbml0PSIyIiBleGlmOkNvbG9yU3BhY2U9IjEiIGV4aWY6UGl4ZWxYRGltZW5zaW9uPSI0MDAiIGV4aWY6UGl4ZWxZRGltZW5zaW9uPSIxODAiPiA8cGhvdG9zaG9wOkRvY3VtZW50QW5jZXN0b3JzPiA8cmRmOkJhZz4gPHJkZjpsaT4wNDQ3MERBRTc0MDczRjE1QzZCRDcyNjFCRjNDMzZCMjwvcmRmOmxpPiA8cmRmOmxpPjE0OTVDMUUyQjRFRkQ4NTg5N0IwNTQxOEIyRDU5OEM5PC9yZGY6bGk+IDxyZGY6bGk+MUY3QjBFNDc5QzM5RUFDMUM5N0U3NjdCM0JBMjM1RTY8L3JkZjpsaT4gPHJkZjpsaT4yMjlDRUZGNDAzOTJFMDU0MTUyOTk4MUQyQjZBNDNFMjwvcmRmOmxpPiA8cmRmOmxpPjJDQzkxMDA5OTQ5RDY5RDdERTkzNzAyRDREQUJERjZFPC9yZGY6bGk+IDxyZGY6bGk+MzE2Rjk5OThCMTFFNDQ1Njk0RjAwNEVGM0VGMjAzMjM8L3JkZjpsaT4gPHJkZjpsaT40MUE1Q0M1RDk0RTBGMDcyQjE1MEJDQTBENDJCODVENDwvcmRmOmxpPiA8cmRmOmxpPjRGNEVCNkIwMzUyQkNDQkU4NDQ5ODVGMEY1NkU5OUEyPC9yZGY6bGk+IDxyZGY6bGk+NTIxNTg0QjMwQkM0N0Y0NzI5Q0ZBRDU0Qjc5QURGOEY8L3JkZjpsaT4gPHJkZjpsaT41REZBODNGODlFNzU2NjcyODE0RkVGODQ1MzczMDE1MDwvcmRmOmxpPiA8cmRmOmxpPjY0OUQ2Rjg2MUQ0QjcyMEJGMTkxQTJCRDA1QTZCRkNGPC9yZGY6bGk+IDxyZGY6bGk+NkRCOTAyOTI5NjVCQzc5MTNFQzI3NjJEOUE1QkE0RUM8L3JkZjpsaT4gPHJkZjpsaT43NEJFOTQzRkI5MTEyMTg4ODRBM0MxNDEzMTQwODNBMzwvcmRmOmxpPiA8cmRmOmxpPjdDQ0RERjZGMTc5RTY0NzdEQ0NFNkNCMUVFQzFBODg3PC9yZGY6bGk+IDxyZGY6bGk+OTM0NEZBNEZDMDg5RTRDNkVGOEI1ODI3Nzk2NzVFMUE8L3JkZjpsaT4gPHJkZjpsaT45OEVGNzc2RjRDMURFOUJGQzg1NTE2MTI5Q0E2RjE3RDwvcmRmOmxpPiA8cmRmOmxpPkE4MzY1ODAzMEM3RDc3RUE4NjYxN0FFQUE0MTdGMDJGPC9yZGY6bGk+IDxyZGY6bGk+QUNGOEI0ODlFNTcxMTA1MzU5QzIzQ0E3OTg1MjVBMTQ8L3JkZjpsaT4gPHJkZjpsaT5CMTU2QkQ3Q0NEMzFENjMzNDhBMjI1M0Y2RkEwNDEzRjwvcmRmOmxpPiA8cmRmOmxpPkI2NDMyQjczNERGMTcwQTFGMTVCN0MzMjdDMTVEMUYyPC9yZGY6bGk+IDxyZGY6bGk+Q0MyOERBMzc4MUUwOTlDRjg5NjM4NUQyRThCOERBMjE8L3JkZjpsaT4gPHJkZjpsaT5EQ0UxRTQxMjVBQzQ1NDRFOEFFNEE5QjVEOTlGNUU4NzwvcmRmOmxpPiA8cmRmOmxpPkUxMjc0MUNGMDQ0MzZBMDg2NjkwMTAzOTVGQ0QyMTUzPC9yZGY6bGk+IDxyZGY6bGk+RTQ4RDRGMTZBOEIzN0I0QTdDRjUxQUQwNTYwRjFFNDU8L3JkZjpsaT4gPHJkZjpsaT5GNjAzRjMzMUNBMjM1QzM0N0M3RUY3OTIyODBBRUY0NTwvcmRmOmxpPiA8cmRmOmxpPkZBN0EwNzQyNjRFMzdCMDg2ODgxMkM0OUQxRTgyRUMwPC9yZGY6bGk+IDxyZGY6bGk+RkVDNDMwQ0FFQjRFMzVBNDYyQzY3NzNERDY4OTJBQUU8L3JkZjpsaT4gPHJkZjpsaT5hZG9iZTpkb2NpZDpwaG90b3Nob3A6MDhiODk5MGEtZThjOS0xMWU4LTk1ZjItY2I3OGI3ZThlYTI0PC9yZGY6bGk+IDxyZGY6bGk+YWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjYwMWExM2RmLWViOGEtMWY0YS1iMmJhLTE3ZWU3ZTRjZGExYzwvcmRmOmxpPiA8cmRmOmxpPmFkb2JlOmRvY2lkOnBob3Rvc2hvcDo4NjkzYzY3OS1iYTNkLWQ0NGYtODE4YS0xZTM5ZTc1ZjI2MTk8L3JkZjpsaT4gPHJkZjps
