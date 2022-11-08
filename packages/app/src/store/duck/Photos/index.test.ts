
import * as T from '^/types';
import { initialMockState } from '^/utilities/test-util';
import { ActionsObservable, StateObservable } from 'redux-observable';
import { Observable, Subject, queueScheduler, scheduled } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { FinishUploadPhotos, UploadPhotos, uploadPhotosEpic } from '.';

test('Uploading JPG file should be succeed', (done) => {
  const testScheduler: TestScheduler = new TestScheduler(() => false);

  testScheduler.run(({ expectObservable }) => {
    const action$: ActionsObservable<any> = new ActionsObservable(
      scheduled(
        [
          UploadPhotos({ files: [new File([], 'test')] }),
        ],
        queueScheduler,
      ),
    );
    const state$: StateObservable<T.State> = new StateObservable(new Subject(), initialMockState);
    const output$: Observable<any> = uploadPhotosEpic(action$, state$, undefined);

    scheduled(
      [uploadPhotosEpic(action$, state$, undefined)],
      queueScheduler,
    ).subscribe((next) => {
      // eslint-disable-next-line no-console
      console.log(next);
      done();
    });

    expectObservable(output$).toBe('FinishUploadPhotos', FinishUploadPhotos);
  });
});

