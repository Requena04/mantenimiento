import {CoursesService} from './courses.service';
import {TestBed} from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {COURSES, findLessonsForCourse} from '../../../../server/db-data';
import {Course} from '../model/course';
import {HttpErrorResponse} from '@angular/common/http';


describe('ServicioCursos', () => {

    let coursesService: CoursesService,
        httpTestingController: HttpTestingController;

    beforeEach(() => {

        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule
            ],
            providers: [
                CoursesService
            ]
        });

        coursesService = TestBed.get(CoursesService),
        httpTestingController = TestBed.get(HttpTestingController);

    });
//Esta prueba deberia mostrar y recuperar todos los cursos que se encuentran creados en el servidor
    it('should retrieve all courses', () => {

        coursesService.findAllCourses()
            .subscribe(courses => {
                expect(courses).toBeTruthy('No devolvio cursos');

                expect(courses.length).toBe(12,"Numero incorrecto de cursos");
                const course = courses.find(course => course.id == 12);
                expect(course.titles.description).toBe("Angular Course");

            });

        const req = httpTestingController.expectOne('/api/courses');
        expect(req.request.method).toEqual("GET");
        req.flush({payload: Object.values(COURSES)});

    });
//Deberia Buscar el curso con respecto a su ID segun asignado
    it('should find a course by id', () => {

        coursesService.findCourseById(12)
            .subscribe(course => {

                expect(course).toBeTruthy();
                expect(course.id).toBe(12);

            });

        const req = httpTestingController.expectOne('/api/courses/12');
        expect(req.request.method).toEqual("GET");
        req.flush(COURSES[12]);
    });
//Deberia guardar o poder alamacenar las modificaciones del curso
    it('should save the course data', () => {
        const changes :Partial<Course> =
            {titles:{description: 'Testing Course'}};

        coursesService.saveCourse(12, changes)
            .subscribe(course => {
                expect(course.id).toBe(12);
            });

        const req = httpTestingController.expectOne('/api/courses/12');
        expect(req.request.method).toEqual("PUT");
        expect(req.request.body.titles.description).toEqual(changes.titles.description);

        req.flush({
            ...COURSES[12],
            ...changes
        })

    });
//Deberia mostrar un error si el curso que se desea guardar falla en el proceso
    it('should give an error if save course fails', () => {

        const changes :Partial<Course> =
            {titles:{description: 'Testing Course'}};

        coursesService.saveCourse(12, changes)
            .subscribe(
                () => fail("the save course operation should have failed"),

                (error: HttpErrorResponse) => {
                    expect(error.status).toBe(500);
                }
            );

        const req = httpTestingController.expectOne('/api/courses/12');
        expect(req.request.method).toEqual("PUT");
        req.flush('Save course failed', {status:500,
            statusText:'Internal Server Error'});
    });
//Buscara la lista de lecciones
    it('should find a list of lessons', () => {

        coursesService.findLessons(12)
            .subscribe(lessons => {

                expect(lessons).toBeTruthy();

                expect(lessons.length).toBe(3);

            });

        const req = httpTestingController.expectOne(
            req => req.url == '/api/lessons');

        expect(req.request.method).toEqual("GET");
        expect(req.request.params.get("courseId")).toEqual("12");
        expect(req.request.params.get("filter")).toEqual("");
        expect(req.request.params.get("sortOrder")).toEqual("asc");
        expect(req.request.params.get("pageNumber")).toEqual("0");
        expect(req.request.params.get("pageSize")).toEqual("3");

        req.flush({
            payload: findLessonsForCourse(12).slice(0,3)
        });


    });

    afterEach(() => {

        httpTestingController.verify();
    });

});















