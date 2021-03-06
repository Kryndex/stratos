import { ListAppEnvVar } from '../../../../data-sources/cf-app-variables-data-source';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableCellEditVariableComponent } from './table-cell-edit-variable.component';
import { CoreModule } from '../../../../../core/core.module';
import { IListDataSource } from '../../../../data-sources/list-data-source-types';

describe('TableCellEditVariableComponent', () => {
  let component: TableCellEditVariableComponent<ListAppEnvVar>;
  let fixture: ComponentFixture<TableCellEditVariableComponent<ListAppEnvVar>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TableCellEditVariableComponent],
      imports: [
        CoreModule,
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableCellEditVariableComponent);
    component = fixture.componentInstance;
    component.row = {
      name: 'name',
      value: 'value'
    };
    component.dataSource = {} as IListDataSource<ListAppEnvVar>;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
