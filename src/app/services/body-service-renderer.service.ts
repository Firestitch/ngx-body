import { Injectable, RendererFactory2, Renderer2 } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute, ActivatedRouteSnapshot, NavigationStart } from '@angular/router';
import { filter } from 'rxjs/operators';


@Injectable()
export class BodyClassRenderer {
  private bodyClassListener;
  private _renderer: Renderer2;

  constructor(private _router: Router,
              private _rendererFactory: RendererFactory2,
              private _route: ActivatedRoute) {
    this._renderer = _rendererFactory.createRenderer(null, null);
  }

  get renderer() {
    return this._renderer;
  }

  set renderer(val) {
    this._renderer = val;
  }

  public destroy() {
    if (this.bodyClassListener) {
      this.bodyClassListener.unsubscribe();
    }
  }

  public addBodyClass(cls) {

    this._renderer.addClass(document.body, this._sanitizeClass(cls));
  }

  public removeBodyClass(cls) {
    this.renderer.removeClass(document.body, this._sanitizeClass(cls));
  }

  public init() {

    this.bodyClassListener = this._router
      .events
      .pipe(
        filter( event => event instanceof NavigationEnd || event instanceof NavigationStart)
      )
      .subscribe((event) => {

        //if (event instanceof NavigationEnd) {

          document.body.className.split(' ')
          .forEach((name) => {
            if (name.match(/^body-/)) {
              this.removeBodyClass(name);
            }
          });

          this._getBodyClasses(this._route.snapshot.firstChild)
          .forEach(cls => {
            this.addBodyClass(cls);
          });
        //}
      });
  }

  private _getBodyClasses(activatedRoute: ActivatedRouteSnapshot) {
    const bodyClasses = [];

    if (activatedRoute) {
      if (activatedRoute.data && activatedRoute.data.bodyClass) {
        bodyClasses.push(...this._parseBodyClasses(activatedRoute.data.bodyClass));
      }

      if (activatedRoute.firstChild) {
        bodyClasses.push(...this._getBodyClasses(activatedRoute.firstChild));
      }
    }

    return bodyClasses;
  }

  private _parseBodyClasses(data) {
    return data.split(/[\s,]/).filter(Boolean);
  }

  private _sanitizeClass(cls) {

    if (cls.indexOf('body-') === -1) {
      return 'body-' + cls;
    }

    return cls;
  }
}
