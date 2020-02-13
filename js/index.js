let dst, dst_cache, dst_center;
let steps;
let index = 0;
let max_time = 40;
let time = max_time;
let begin = new Date().getTime(), end;
let garden;
let offsetX, offsetY;

function getHeartPoint(angle) {
    let t = angle / Math.PI;
    let x = 19.5 * (16 * Math.pow(Math.sin(t), 3));
    let y = - 20 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    return [offsetX + 1.5*x, offsetY + 1.5*y];
}

function heart(){
    $heart = $("#heart");
    offsetX = $heart.width() / 2;
    offsetY = $heart.height() / 2 - 55;
    let $garden = $("#garden");
    let gardenCanvas = $garden[0];
    gardenCanvas.width = $heart.width();
    gardenCanvas.height = $heart.height();
    let gardenCtx = gardenCanvas.getContext("2d");
    gardenCtx.globalCompositeOperation = "lighter";
    garden = new Garden(gardenCtx, gardenCanvas);
}

function draw(){
    requestAnimationFrame(draw);

    end = new Date().getTime();
    let cost = end - begin;
    if(cost < time) return;

    if(index == 600) time /= 2
    else if(index == 100) time /= 2
    if (index >= steps.length) return

    let step = steps[index];

    let show_step = $P.Step.deserialize(step);
    let cache_step = $P.Step.deserialize(step);

    show_step.color = 'rgb(255, 0, 0)';

    dst.ctx.drawImage(dst_cache.node, 0, 0);
    dst.drawStep(show_step);
    dst_cache.drawStep(cache_step);

    index++;
    begin = end;
    if(index === steps.length) {
        setInterval(function () {
            garden.render();
        }, Garden.options.growSpeed);

        let interval = 50;
        let angle = 10;
        let heart = [];
        let animationTimer = setInterval(function () {
            let bloom = getHeartPoint(angle);
            let draw = true;
            for (let i = 0; i < heart.length; i++) {
                let p = heart[i];
                let distance = Math.sqrt(Math.pow(p[0] - bloom[0], 2) + Math.pow(p[1] - bloom[1], 2));
                if (distance < Garden.options.bloomRadius.max * 1.3) {
                    draw = false;
                    break;
                }
            }
            
            if (draw) {
                heart.push(bloom);
                garden.createRandomBloom(bloom[0], bloom[1]);
            }
            if (angle >= 30) {
                clearInterval(animationTimer);
                let list = $('#list-container');
                list.css('z-index', '9999')
                TweenMax.to($('#container'), 1, { x: window.innerWidth / 4 })
                TweenMax.to(list, 0.5, { opacity: 1, delay: 0.5 })
            } else {
                angle += 0.2;
            }
        }, interval);
    }
}

let looper_time = 3 * 1000;
let run_once = true;
let i = 0;

function do_barrager() {
    if (run_once) {
        looper = setInterval(do_barrager, looper_time);
        run_once = false;
    }
    let language = Object.keys(love);
    let loves = Object.values(love);
    let data = { info: `I want to say ${loves[i]()} to you in ${language[i]}...`}
    i++
    $('body').barrager(data);
}

$(document).ready(function () {
    fetch('steps.json')
        .then(response => {
            return response.json()
        }).then(json => {
            let cfg = json.config;
            dst = $P.Canvas.empty(cfg);
            dst_cache = $P.Canvas.empty(cfg);
            dst_center = [cfg.scale * cfg.width / 2, cfg.scale * cfg.height / 2];

            $("#drawing").append(dst.node);
            steps = json.steps;

            heart();
            draw();
        });

    do_barrager();
});