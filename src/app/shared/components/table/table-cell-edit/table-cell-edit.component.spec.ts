import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableCellEditComponent } from './table-cell-edit.component';
import { CoreModule } from '../../../../core/core.module';
import { IListDataSource } from '../../../data-sources/list-data-source-types';

describe('TableCellEditComponent', () => {
  let component: TableCellEditComponent<any>;
  let fixture: ComponentFixture<TableCellEditComponent<any>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TableCellEditComponent],
      imports: [
        CoreModule,
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableCellEditComponent);
    component = fixture.componentInstance;
    component.row = {};
    component.dataSource = {} as IListDataSource<any>;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
