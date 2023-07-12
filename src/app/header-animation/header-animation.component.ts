import { Component, AfterViewInit, HostListener, ElementRef, ViewChild } from '@angular/core';
//import { TweenLite, Circ } from 'gsap';
//import { gsap } from 'gsap';
import { gsap, Circ } from 'gsap';

@Component({
  selector: 'app-header-animation',
  templateUrl: './header-animation.component.html',
  styleUrls: ['./header-animation.component.css']
})
export class HeaderAnimationComponent implements AfterViewInit {
  @ViewChild('largeHeader', { static: true }) largeHeader!: ElementRef;
  @ViewChild('demoCanvas') demoCanvas!: ElementRef;
  @ViewChild('soccerField', { static: true })
  soccerCanvas!: ElementRef<HTMLCanvasElement>;

  width!: number;
  height!: number;
  canvas!: HTMLCanvasElement;
  ctx!: CanvasRenderingContext2D;
  //ctx!: CanvasRenderingContext2D | null;
  points: any[] = [];
  target: { x: number, y: number } = { x: 0, y: 0 };
  animateHeader = true;

  ngAfterViewInit() {
    this.initHeader();
    this.initAnimation();
  }

  initHeader() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.target = { x: this.width / 2, y: this.height / 2 };

    this.largeHeader.nativeElement.style.height = this.height + 'px';

    this.canvas = this.demoCanvas.nativeElement;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext('2d')!;

    // create points
    this.points = [];
    for (let x = 0; x < this.width; x = x + this.width / 20) {
      for (let y = 0; y < this.height; y = y + this.height / 20) {
        const px = x + Math.random() * this.width / 20;
        const py = y + Math.random() * this.height / 20;
        const p = { x: px, originX: px, y: py, originY: py };
        this.points.push(p);
      }
    }

    // for each point find the 5 closest points
    for (let i = 0; i < this.points.length; i++) {
      const closest: any[] = [];
      const p1 = this.points[i];
      for (let j = 0; j < this.points.length; j++) {
        const p2 = this.points[j];
        if (!(p1 == p2)) {
          let placed = false;
          for (let k = 0; k < 5; k++) {
            if (!placed) {
              if (closest[k] == undefined) {
                closest[k] = p2;
                placed = true;
              }
            }
          }

          for (let k = 0; k < 5; k++) {
            if (!placed) {
              if (this.getDistance(p1, p2) < this.getDistance(p1, closest[k])) {
                closest[k] = p2;
                placed = true;
              }
            }
          }
        }
      }
      p1.closest = closest;
    }

    // assign a circle to each point
    for (let i in this.points) {
      const c = new Circle(this.points[i], 2 + Math.random() * 2, 'rgba(255,255,255,0.3)');
      this.points[i].circle = c;
    }
  }

  @HostListener('window:mousemove', ['$event'])
  mouseMove(e: MouseEvent) {
    let posx = 0;
    let posy = 0;
    if (e.pageX || e.pageY) {
      posx = e.pageX;
      posy = e.pageY;
    } else if (e.clientX || e.clientY) {
      posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
      posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    this.target.x = posx;
    this.target.y = posy;
  }

  @HostListener('window:scroll', ['$event'])
  scrollCheck() {
    if (document.body.scrollTop > this.height) {
      this.animateHeader = false;
    } else {
      this.animateHeader = true;
    }
  }

  @HostListener('window:resize', ['$event'])
  resize() {
    if (this.largeHeader && this.largeHeader.nativeElement && this.canvas) {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.largeHeader.nativeElement.style.height = this.height + 'px';
      this.canvas.width = this.width;
      this.canvas.height = this.height;
    }
  }



  initAnimation() {
    this.animate();
    for (const point of this.points) {
      this.shiftPoint(point);
    }
  }

  animate() {
    if (this.animateHeader && this.ctx) {
      this.ctx.clearRect(0, 0, this.width, this.height);
      for (const point of this.points) {
        if (Math.abs(this.getDistance(this.target, point)) < 4000) {
          point.active = 0.3;
          point.circle.active = 0.6;
        } else if (Math.abs(this.getDistance(this.target, point)) < 20000) {
          point.active = 0.1;
          point.circle.active = 0.3;
        } else if (Math.abs(this.getDistance(this.target, point)) < 40000) {
          point.active = 0.02;
          point.circle.active = 0.1;
        } else {
          point.active = 0;
          point.circle.active = 0;
        }

        this.drawLines(point);
        point.circle.draw(this.ctx);
      }
    }
    requestAnimationFrame(() => this.animate());
  }



  shiftPoint(p: any) {
    gsap.to(p, {
      duration: 1 + 1 * Math.random(),
      x: p.originX - 50 + Math.random() * 100,
      y: p.originY - 50 + Math.random() * 100,
      ease: Circ.easeInOut,
      onComplete: () => {
        this.shiftPoint(p);
      }
    });
  }

  drawLines(p: any) {
    if (!p.active) return;
    for (const closestPoint of p.closest) {
      this.ctx.beginPath();
      this.ctx.moveTo(p.x, p.y);
      this.ctx.lineTo(closestPoint.x, closestPoint.y);
      this.ctx.strokeStyle = 'rgba(156,217,249,' + p.active + ')';
      this.ctx.stroke();
    }
  }

  getDistance(p1: any, p2: any) {
    return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
  }
}

class Circle {
  pos: any;
  radius: any;
  color: any;
  active: any;

  constructor(pos: any, rad: any, color: any) {
    this.pos = pos || null;
    this.radius = rad || null;
    this.color = color || null;
    this.active = 0;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.active) return;
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'rgba(156,217,249,' + this.active + ')';
    ctx.fill();
  }
}


