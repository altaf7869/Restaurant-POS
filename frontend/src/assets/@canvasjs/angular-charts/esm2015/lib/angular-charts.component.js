/*
CanvasJS Angular Chart- https://canvasjs.com/
Copyright 2024 fenopix

--------------------- License Information --------------------
The software in CanvasJS Angular Chart is free and open-source. But, CanvasJS Angular Chart relies on CanvasJS Chart which requires a valid CanvasJS Chart license for commercial use. Please refer to the following link for further details https://canvasjs.com/license/

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the �Software�), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED �AS IS�, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
/*tslint:disable*/
/*eslint-disable*/
/*jshint ignore:start*/
import { Component, Input, Output, EventEmitter } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
if (typeof document === 'object' && !!document) {
    //@ts-ignore
    var CanvasJS = require('../../charts');
}
class CanvasJSChart {
    constructor() {
        this.shouldUpdateChart = false;
        this.isDOMPresent = typeof document === "object" && !!document;
        this.chartInstance = new EventEmitter();
        this.options = this.options ? this.options : {};
        this.styles = this.styles ? this.styles : { width: "100%", position: "relative" };
        this.styles.height = this.options.height ? this.options.height + "px" : "400px";
        this.chartContainerId = 'canvasjs-angular-chart-container-' + CanvasJSChart._cjsChartContainerId++;
    }
    ngDoCheck() {
        if (this.prevChartOptions != this.options) {
            this.shouldUpdateChart = true;
        }
    }
    ngOnChanges() {
        //Update Chart Options & Render
        if (this.shouldUpdateChart && this.chart) {
            this.chart.options = this.options;
            this.chart.render();
            this.shouldUpdateChart = false;
            this.prevChartOptions = this.options;
        }
    }
    ngAfterViewInit() {
        if (this.isDOMPresent) {
            this.chart = new CanvasJS.Chart(this.chartContainerId, this.options);
            this.chart.render();
            this.prevChartOptions = this.options;
            this.chartInstance.emit(this.chart);
        }
    }
    ngOnDestroy() {
        if (this.chart)
            this.chart.destroy();
    }
}
CanvasJSChart._cjsChartContainerId = 0;
CanvasJSChart.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.17", ngImport: i0, type: CanvasJSChart, deps: [], target: i0.ɵɵFactoryTarget.Component });
CanvasJSChart.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "12.2.17", type: CanvasJSChart, selector: "canvasjs-chart", inputs: { options: "options", styles: "styles" }, outputs: { chartInstance: "chartInstance" }, usesOnChanges: true, ngImport: i0, template: '<div *ngIf="isDOMPresent" id="{{chartContainerId}}" [ngStyle]="styles"></div>', isInline: true, directives: [{ type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { type: i1.NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.2.17", ngImport: i0, type: CanvasJSChart, decorators: [{
            type: Component,
            args: [{
                    selector: 'canvasjs-chart',
                    template: '<div *ngIf="isDOMPresent" id="{{chartContainerId}}" [ngStyle]="styles"></div>'
                }]
        }], ctorParameters: function () { return []; }, propDecorators: { options: [{
                type: Input
            }], styles: [{
                type: Input
            }], chartInstance: [{
                type: Output
            }] } });
export { CanvasJSChart };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhci1jaGFydHMuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvYW5ndWxhci1jaGFydHMvc3JjL2xpYi9hbmd1bGFyLWNoYXJ0cy5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7RUFhRTtBQUNGLGtCQUFrQjtBQUNsQixrQkFBa0I7QUFDbEIsdUJBQXVCO0FBQ3ZCLE9BQU8sRUFBRSxTQUFTLEVBQXVDLEtBQUssRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLE1BQU0sZUFBZSxDQUFDOzs7QUFFNUcsSUFBRyxPQUFPLFFBQVEsS0FBSyxRQUFRLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRTtJQUM5QyxZQUFZO0lBQ1osSUFBSSxRQUFRLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7Q0FDM0M7QUFFRCxNQUtNLGFBQWE7SUFnQmxCO1FBWEEsc0JBQWlCLEdBQUcsS0FBSyxDQUFDO1FBQzFCLGlCQUFZLEdBQUcsT0FBTyxRQUFRLEtBQUssUUFBUSxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUM7UUFRMUQsa0JBQWEsR0FBRyxJQUFJLFlBQVksRUFBVSxDQUFDO1FBRzFDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ2hELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsQ0FBQztRQUNsRixJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7UUFFaEYsSUFBSSxDQUFDLGdCQUFnQixHQUFHLG1DQUFtQyxHQUFHLGFBQWEsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO0lBQ3BHLENBQUM7SUFFRCxTQUFTO1FBQ1IsSUFBRyxJQUFJLENBQUMsZ0JBQWdCLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUN6QyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDO1NBQzlCO0lBQ0YsQ0FBQztJQUVELFdBQVc7UUFDViwrQkFBK0I7UUFDL0IsSUFBRyxJQUFJLENBQUMsaUJBQWlCLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtZQUN4QyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1lBQ2xDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDcEIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLEtBQUssQ0FBQztZQUMvQixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztTQUNyQztJQUNGLENBQUM7SUFFRCxlQUFlO1FBQ2QsSUFBRyxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQ3JCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDckUsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNwQixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztZQUNyQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDcEM7SUFDRixDQUFDO0lBRUQsV0FBVztRQUNWLElBQUcsSUFBSSxDQUFDLEtBQUs7WUFDWixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ3ZCLENBQUM7O0FBbkRNLGtDQUFvQixHQUFHLENBQUMsQ0FBQzsyR0FEM0IsYUFBYTsrRkFBYixhQUFhLDBLQUhSLCtFQUErRTs0RkFHcEYsYUFBYTtrQkFMbEIsU0FBUzttQkFBQztvQkFDVixRQUFRLEVBQUUsZ0JBQWdCO29CQUMxQixRQUFRLEVBQUUsK0VBQStFO2lCQUN6RjswRUFXQSxPQUFPO3NCQUROLEtBQUs7Z0JBR04sTUFBTTtzQkFETCxLQUFLO2dCQUlOLGFBQWE7c0JBRFosTUFBTTs7QUEwQ1IsT0FBTyxFQUNOLGFBQWEsRUFDYixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLypcclxuQ2FudmFzSlMgQW5ndWxhciBDaGFydC0gaHR0cHM6Ly9jYW52YXNqcy5jb20vXHJcbkNvcHlyaWdodCAyMDIzIGZlbm9waXhcclxuXHJcbi0tLS0tLS0tLS0tLS0tLS0tLS0tLSBMaWNlbnNlIEluZm9ybWF0aW9uIC0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblRoZSBzb2Z0d2FyZSBpbiBDYW52YXNKUyBBbmd1bGFyIENoYXJ0IGlzIGZyZWUgYW5kIG9wZW4tc291cmNlLiBCdXQsIENhbnZhc0pTIEFuZ3VsYXIgQ2hhcnQgcmVsaWVzIG9uIENhbnZhc0pTIENoYXJ0IHdoaWNoIHJlcXVpcmVzIGEgdmFsaWQgQ2FudmFzSlMgQ2hhcnQgbGljZW5zZSBmb3IgY29tbWVyY2lhbCB1c2UuIFBsZWFzZSByZWZlciB0byB0aGUgZm9sbG93aW5nIGxpbmsgZm9yIGZ1cnRoZXIgZGV0YWlscyBodHRwczovL2NhbnZhc2pzLmNvbS9saWNlbnNlL1xyXG5cclxuUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSDvv71Tb2Z0d2FyZe+/vSksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxyXG5cclxuVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXHJcblxyXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQg77+9QVMgSVPvv70sIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxyXG5cclxuKi9cclxuLyp0c2xpbnQ6ZGlzYWJsZSovXHJcbi8qZXNsaW50LWRpc2FibGUqL1xyXG4vKmpzaGludCBpZ25vcmU6c3RhcnQqL1xyXG5pbXBvcnQgeyBDb21wb25lbnQsIEFmdGVyVmlld0luaXQsIE9uQ2hhbmdlcywgT25EZXN0cm95LCBJbnB1dCwgT3V0cHV0LCBFdmVudEVtaXR0ZXIgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuZGVjbGFyZSB2YXIgcmVxdWlyZTogYW55O1xyXG5pZih0eXBlb2YgZG9jdW1lbnQgPT09ICdvYmplY3QnICYmICEhZG9jdW1lbnQpIHtcclxuXHQvL0B0cy1pZ25vcmVcclxuXHR2YXIgQ2FudmFzSlMgPSByZXF1aXJlKCdAY2FudmFzanMvY2hhcnRzJyk7XHJcbn1cclxuXHJcbkBDb21wb25lbnQoe1xyXG5cdHNlbGVjdG9yOiAnY2FudmFzanMtY2hhcnQnLFxyXG5cdHRlbXBsYXRlOiAnPGRpdiAqbmdJZj1cImlzRE9NUHJlc2VudFwiIGlkPVwie3tjaGFydENvbnRhaW5lcklkfX1cIiBbbmdTdHlsZV09XCJzdHlsZXNcIj48L2Rpdj4nXHJcbn0pXHJcblxyXG5jbGFzcyBDYW52YXNKU0NoYXJ0IGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCwgT25DaGFuZ2VzLCBPbkRlc3Ryb3kge1xyXG5cdHN0YXRpYyBfY2pzQ2hhcnRDb250YWluZXJJZCA9IDA7XHJcblx0Y2hhcnQ6IGFueTtcclxuXHRjaGFydENvbnRhaW5lcklkOiBhbnk7XHJcblx0cHJldkNoYXJ0T3B0aW9uczogYW55O1xyXG5cdHNob3VsZFVwZGF0ZUNoYXJ0ID0gZmFsc2U7XHJcblx0aXNET01QcmVzZW50ID0gdHlwZW9mIGRvY3VtZW50ID09PSBcIm9iamVjdFwiICYmICEhZG9jdW1lbnQ7XHJcblxyXG5cdEBJbnB1dCgpXHJcblx0b3B0aW9uczogYW55O1xyXG5cdEBJbnB1dCgpXHJcblx0c3R5bGVzOiBhbnk7XHJcblxyXG5cdEBPdXRwdXQoKVxyXG5cdGNoYXJ0SW5zdGFuY2UgPSBuZXcgRXZlbnRFbWl0dGVyPG9iamVjdD4oKTtcclxuXHJcblx0Y29uc3RydWN0b3IoKSB7XHJcblx0XHR0aGlzLm9wdGlvbnMgPSB0aGlzLm9wdGlvbnMgPyB0aGlzLm9wdGlvbnMgOiB7fTtcclxuXHRcdHRoaXMuc3R5bGVzID0gdGhpcy5zdHlsZXMgPyB0aGlzLnN0eWxlcyA6IHsgd2lkdGg6IFwiMTAwJVwiLCBwb3NpdGlvbjogXCJyZWxhdGl2ZVwiIH07XHJcblx0XHR0aGlzLnN0eWxlcy5oZWlnaHQgPSB0aGlzLm9wdGlvbnMuaGVpZ2h0ID8gdGhpcy5vcHRpb25zLmhlaWdodCArIFwicHhcIiA6IFwiNDAwcHhcIjtcclxuXHJcblx0XHR0aGlzLmNoYXJ0Q29udGFpbmVySWQgPSAnY2FudmFzanMtYW5ndWxhci1jaGFydC1jb250YWluZXItJyArIENhbnZhc0pTQ2hhcnQuX2Nqc0NoYXJ0Q29udGFpbmVySWQrKztcclxuXHR9XHJcblxyXG5cdG5nRG9DaGVjaygpIHtcclxuXHRcdGlmKHRoaXMucHJldkNoYXJ0T3B0aW9ucyAhPSB0aGlzLm9wdGlvbnMpIHtcclxuXHRcdFx0dGhpcy5zaG91bGRVcGRhdGVDaGFydCA9IHRydWU7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRuZ09uQ2hhbmdlcygpIHtcclxuXHRcdC8vVXBkYXRlIENoYXJ0IE9wdGlvbnMgJiBSZW5kZXJcclxuXHRcdGlmKHRoaXMuc2hvdWxkVXBkYXRlQ2hhcnQgJiYgdGhpcy5jaGFydCkge1xyXG5cdFx0XHR0aGlzLmNoYXJ0Lm9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XHJcblx0XHRcdHRoaXMuY2hhcnQucmVuZGVyKCk7XHJcblx0XHRcdHRoaXMuc2hvdWxkVXBkYXRlQ2hhcnQgPSBmYWxzZTtcclxuXHRcdFx0dGhpcy5wcmV2Q2hhcnRPcHRpb25zID0gdGhpcy5vcHRpb25zO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0bmdBZnRlclZpZXdJbml0KCkge1xyXG5cdFx0aWYodGhpcy5pc0RPTVByZXNlbnQpIHtcclxuXHRcdFx0dGhpcy5jaGFydCA9IG5ldyBDYW52YXNKUy5DaGFydCh0aGlzLmNoYXJ0Q29udGFpbmVySWQsIHRoaXMub3B0aW9ucyk7XHJcblx0XHRcdHRoaXMuY2hhcnQucmVuZGVyKCk7XHJcblx0XHRcdHRoaXMucHJldkNoYXJ0T3B0aW9ucyA9IHRoaXMub3B0aW9ucztcclxuXHRcdFx0dGhpcy5jaGFydEluc3RhbmNlLmVtaXQodGhpcy5jaGFydCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRuZ09uRGVzdHJveSgpIHtcclxuXHRcdGlmKHRoaXMuY2hhcnQpXHJcblx0XHRcdHRoaXMuY2hhcnQuZGVzdHJveSgpO1xyXG5cdH1cclxufVxyXG5cclxuZXhwb3J0IHtcclxuXHRDYW52YXNKU0NoYXJ0XHJcbn07XHJcblxyXG4vKnRzbGludDplbmFibGUqL1xyXG4vKmVzbGludC1lbmFibGUqL1xyXG4vKmpzaGludCBpZ25vcmU6ZW5kKi8iXX0=