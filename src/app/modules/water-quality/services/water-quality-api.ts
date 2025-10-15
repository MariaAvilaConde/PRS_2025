import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../shared/models/api-response.model';
import { QualityTest, QualityTestRequest, QualityTestResponse, TestingPoints } from '../models/quality-test.model';
import { ChlorineRecord, ChlorineRecordRequest } from '../models/chlorine-record.model';

@Injectable({
  providedIn: 'root'
})
export class WaterQualityApi {
  private readonly baseUrl = `${environment.services.gateway}`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener todos los registros de análisis
   */
  getAllTests(organizationId: string): Observable<ApiResponse<QualityTestResponse[]>> {
    const params = new HttpParams().set('organizationId', organizationId);
    return this.http.get<ApiResponse<QualityTestResponse[]>>(`${this.baseUrl}/tests`, { params });
  }

  /**
   * Obtener registros activos
   */
  getActiveTests(organizationId: string): Observable<ApiResponse<QualityTestResponse[]>> {
    const params = new HttpParams().set('organizationId', organizationId);
    return this.http.get<ApiResponse<QualityTestResponse[]>>(`${this.baseUrl}/active`, { params });
  }

  /**
   * Obtener registros completados
   */
  getCompletedTests(organizationId: string): Observable<ApiResponse<QualityTestResponse[]>> {
    const params = new HttpParams().set('organizationId', organizationId);
    return this.http.get<ApiResponse<QualityTestResponse[]>>(`${this.baseUrl}/completed`, { params });
  }

  /**
   * Obtener registro de análisis por ID
   */
  getTestById(id: string): Observable<ApiResponse<QualityTest>> {
    return this.http.get<ApiResponse<QualityTest>>(`${this.baseUrl}/${id}`);
  }
  
  // Obtener el listado 
  getAllQualityTests(): Observable<ApiResponse<QualityTest[]>>{
    return this.http.get<ApiResponse<QualityTest[]>>(`${this.baseUrl}/admin/quality/tests`);
  }

  getQualityTestById(id: string): Observable<ApiResponse<QualityTest>>{
    return this.http.get<ApiResponse<QualityTest>>(`${this.baseUrl}/admin/quality/tests/${id}`);
  }

  createQualityTest(qualityTest: QualityTestRequest): Observable<ApiResponse<QualityTest>>{
    return this.http.post<ApiResponse<QualityTest>>(`${this.baseUrl}/admin/quality/tests`, qualityTest);
  }

  updateQualityTest(id: string, qualityTest: QualityTestRequest): Observable<ApiResponse<QualityTest>>{
    return this.http.put<ApiResponse<QualityTest>>(`${this.baseUrl}/admin/quality/tests/${id}`, qualityTest);
  }

  getAllTestingPointsByOrganizationId(organizationId: string): Observable<ApiResponse<TestingPoints[]>> {
    const params = new HttpParams().set('organizationId', organizationId);
    return this.http.get<ApiResponse<TestingPoints[]>>(`${this.baseUrl}/admin/quality/sampling-points`, { params });
  }

  // Chlorine Records
  getAllChlorineRecords(): Observable<ApiResponse<ChlorineRecord[]>> {
    return this.http.get<ApiResponse<ChlorineRecord[]>>(`${this.baseUrl}/admin/quality/daily-records`);
  }

  getChlorineRecordById(id: string): Observable<ApiResponse<ChlorineRecord>> {
    return this.http.get<ApiResponse<ChlorineRecord>>(`${this.baseUrl}/admin/quality/daily-records/${id}`);
  }

  createChlorineRecord(record: ChlorineRecordRequest): Observable<ApiResponse<ChlorineRecord>> {
    return this.http.post<ApiResponse<ChlorineRecord>>(`${this.baseUrl}/admin/quality/daily-records`, record);
  }

  updateChlorineRecord(id: string, record: ChlorineRecordRequest): Observable<ApiResponse<ChlorineRecord>> {
    return this.http.put<ApiResponse<ChlorineRecord>>(`${this.baseUrl}/admin/quality/daily-records/${id}`, record);
  }

  deleteChlorineRecord(id: string): Observable<ApiResponse<ChlorineRecord>> {
    return this.http.delete<ApiResponse<ChlorineRecord>>(`${this.baseUrl}/admin/quality/daily-records/${id}`);
  }

  // Testing Points
  getTestingPointsByOrganizationId(organizationId: string): Observable<ApiResponse<TestingPoints[]>> {
    const params = new HttpParams().set('organizationId', organizationId);
    return this.http.get<ApiResponse<TestingPoints[]>>(`${this.baseUrl}/admin/quality/sampling-points`, { params });
  }

  getTestingPointById(id: string): Observable<ApiResponse<TestingPoints>> {
    return this.http.get<ApiResponse<TestingPoints>>(`${this.baseUrl}/admin/quality/sampling-points/${id}`);
  }

  createTestingPoint(testingPoint: TestingPoints): Observable<ApiResponse<TestingPoints>> {
    return this.http.post<ApiResponse<TestingPoints>>(`${this.baseUrl}/admin/quality/sampling-points`, testingPoint);
  }

  updateTestingPoint(id: string, testingPoint: TestingPoints): Observable<ApiResponse<TestingPoints>> {
    return this.http.put<ApiResponse<TestingPoints>>(`${this.baseUrl}/admin/quality/sampling-points/${id}`, testingPoint);
  }

  deleteTestingPoint(id: string): Observable<ApiResponse<TestingPoints>> {
    return this.http.delete<ApiResponse<TestingPoints>>(`${this.baseUrl}/admin/quality/sampling-points/${id}`);
  }
}