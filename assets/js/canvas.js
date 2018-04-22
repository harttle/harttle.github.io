(function () {
    var requestAnimFrame = getAnimationFrame();
    var G = 1;
    var resistance = 0.9;
    var mouseX = 0;
    var mouseY = 0;
    var FMOUSE = 100;
    var canvas = document.querySelector('canvas#universe');
    var container = document.querySelector('.jumbotron');
    container.style.background = 'none';
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    var ctx = canvas.getContext('2d');
    var sun = {
        m: 1e5,
        r: 15,
        sign: 1,
        color: 'white',
        l: [range(35, canvas.width - 35), range(35, canvas.height - 35)],
        v: [range(-0.1, 0.1), range(-0.1, 0.1)]
    };
    var p1 = {
        m: 1e2,
        r: 7,
        sign: 1,
        color: '#ec232f',
        l: [sun.l[0], sun.l[1] - 25],
        v: [-6, 0]
    };
    var p2 = {
        m: 1e3,
        r: 10,
        sign: 1,
        color: '#32ee22',
        l: [sun.l[0], sun.l[1] + 120],
        v: [3.9, 0]
    };
    var stars = [sun, p1, p2];

    render();

    container.addEventListener('mousemove', function (e) {
        mouseX = e.offsetX;
        mouseY = e.offsetY;
    });
    container.addEventListener('mouseout', function () {
        mouseY = mouseX = 0;
    });
    container.addEventListener('click', function (e) {
        var scrolling = (document.scrollingElement || document.documentElement);
        var y = e.clientY + scrolling.scrollTop - container.offsetTop;
        var r = range(5, 25);
        stars.push({
            r: r,
            m: range(10, 1000),
            color: getRandomColor(),
            l: [e.clientX, y],
            sign: Math.sign(Math.random() - 0.5),
            v: [range(-0.5, 0.5), range(-0.5, 0.5)]
        });
    });
    window.addEventListener('resize', function () {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
    });

    function range (min, max) {
        return Math.random() * (max - min) + min;
    }
    function getRandomColor () {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    function render () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        stars.forEach(function (star) {
            star.f = [0, 0];
        });
        for (var i = 0; i < stars.length; i++) {
            applyMouse(stars[i]);
            for (var j = i + 1; j < stars.length; j++) {
                var fg = Fg(stars[i], stars[j]);
                applyF(stars[i], stars[j], fg);
            }
        }
        stars.forEach(function (star) {
            draw(star);
            accelerate(star);
            nextMove(star);
        });
        requestAnimFrame(render);
    }
    function accelerate (star) {
        star.v[0] += star.f[0] / star.m;
        star.v[1] += star.f[1] / star.m;
    }
    function applyF (lhs, rhs, fg) {
        var sign = lhs.sign * rhs.sign;
        lhs.f[0] += fg[0] * sign;
        lhs.f[1] += fg[1] * sign;
        rhs.f[0] -= fg[0] * sign;
        rhs.f[1] -= fg[1] * sign;
    }
    function applyMouse (star) {
        if (mouseX === 0 || mouseY === 0) {
            return;
        }
        var lx = star.l[0] - mouseX;
        var ly = star.l[1] - mouseY;
        var lx2 = lx * lx;
        var ly2 = ly * ly;
        var r2 = Math.max(lx2 + ly2, 1);
        var f = FMOUSE * star.m * star.m / r2;
        var fx = Math.sign(lx) * Math.sqrt(f * lx2 / r2);
        var fy = Math.sign(ly) * Math.sqrt(f * ly2 / r2);
        star.f[0] += fx;
        star.f[1] += fy;
    }
    function Fg (lhs, rhs) {
        var lx = rhs.l[0] - lhs.l[0];
        var ly = rhs.l[1] - lhs.l[1];
        var lx2 = lx * lx;
        var ly2 = ly * ly;
        var r2 = Math.max(lx2 + ly2, 1);
        var f = G * lhs.m * rhs.m / r2;
        var fx = Math.sign(lx) * Math.sqrt(f * lx2 / r2);
        var fy = Math.sign(ly) * Math.sqrt(f * ly2 / r2);
        return [fx, fy];
    }
    function draw (star) {
        ctx.beginPath();
        ctx.arc(star.l[0], star.l[1], star.r, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.fillStyle = star.color;
        ctx.fill();
    }
    function nextMove (star) {
        var x = star.l[0] + star.v[0];
        var y = star.l[1] + star.v[1];
        if (x > canvas.width - star.r || x < star.r) {
            star.v[0] = -star.v[0] * resistance;
        }
        if (y > canvas.height - star.r || y < star.r) {
            star.v[1] = -star.v[1] * resistance;
        }

        star.l[0] += star.v[0];
        star.l[1] += star.v[1];
    }
    function getAnimationFrame () {
        return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function (callback) { window.setTimeout(callback, 1000 / 60); };
    }
})();
