/*!
 * @license
 * Copyright 2019 Alfresco, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, Input, Inject } from '@angular/core';
import {
    Process,
    AmaState,
    OpenConfirmDialogAction,
    ProcessContent,
    EntityDialogForm,
    ProcessModelerServiceToken,
    ProcessModelerService,
    BreadcrumbItem,
    SnackbarInfoAction,
    SnackbarErrorAction
} from 'ama-sdk';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { DeleteProcessAttemptAction, ValidateProcessAttemptAction, DownloadProcessAction, UpdateProcessAttemptAction, DownloadProcessSVGImageAction } from '../../store/process-editor.actions';
import { documentationHandler } from '../../services/bpmn-js/property-handlers/documentation.handler';
import { modelNameHandler } from '../../services/bpmn-js/property-handlers/model-name.handler';

@Component({
    selector: 'ama-process-header',
    templateUrl: './process-header.component.html'
})
export class ProcessHeaderComponent {
    @Input() process: Process;
    @Input() content: ProcessContent;
    @Input() breadcrumbs$: Observable<BreadcrumbItem[]>;
    @Input() disableSave = false;
    public modeler: Bpmn.Modeler;

    constructor(
        private store: Store<AmaState>,
        @Inject(ProcessModelerServiceToken) private processModeler: ProcessModelerService
    ) {}

    onSaveClick(): void {
        const element = this.processModeler.getRootProcessElement();
        const metadata: Partial<EntityDialogForm> = {
            name: modelNameHandler.get(element),
            description: documentationHandler.get(element),
        };

        this.store.dispatch(new ValidateProcessAttemptAction({
            title: 'APP.DIALOGS.CONFIRM.SAVE.PROCESS',
            processId: this.process.id,
            content: this.content,
            extensions: this.process.extensions,
            action: new UpdateProcessAttemptAction({ processId: this.process.id, content: this.content, metadata })
        }));
    }

    onDownload(process: Process): void {
        this.store.dispatch(new ValidateProcessAttemptAction({
            title: 'APP.DIALOGS.CONFIRM.DOWNLOAD.PROCESS',
            processId: process.id,
            content: this.content,
            extensions: this.process.extensions,
            action: new DownloadProcessAction(process)
        }));
    }

    deleteProcess(): void {
        this.store.dispatch(
            new OpenConfirmDialogAction({
                dialogData: { title: 'APP.DIALOGS.CONFIRM.DELETE.PROCESS' },
                action: new DeleteProcessAttemptAction(this.process.id)
            })
        );
    }

    onSaveProcessImage(process: Process): void {
        this.store.dispatch(new ValidateProcessAttemptAction({
            title: 'APP.DIALOGS.CONFIRM.DOWNLOAD.IMAGE',
            processId: process.id,
            content: this.content,
            extensions: this.process.extensions,
            action: new DownloadProcessSVGImageAction(process)
        }));
    }

    onValidateProcess(process: Process): void {
        this.store.dispatch(new ValidateProcessAttemptAction({
            title: 'APP.DIALOGS.ERROR.SUBTITLE',
            processId: process.id,
            content: this.content,
            extensions: this.process.extensions,
            action: new SnackbarInfoAction('PROCESS_EDITOR.PROCESS_VALID'),
            errorAction: new SnackbarErrorAction('PROCESS_EDITOR.PROCESS_INVALID')
        }));
    }
}
