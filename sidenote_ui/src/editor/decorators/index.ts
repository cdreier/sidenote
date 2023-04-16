import { CompositeDecorator } from 'draft-js'

import Current from '../../store/Current'
import { CheckboxDecorator, checkboxStrategy } from './CheckboxDecorator'
import { DocLinkDecorator, docLinkStrategy } from './DocLinkDecorator'
import { InlineImageDecorator, inlineImageStrategy } from './InlineImageDecorator'
import { LabelDecorator, labelStrategy } from './LabelDecorator'
import { LinkDecorator, linkStrategy } from './LinkDecorator'
import { NewImageDecorator, newImageStrategy } from './NewImageDecorator'
import { TitleDecorator, titleStrategy } from './TitleDecorator'

const compositeDecorator = (c: Current) => new CompositeDecorator([
  {
    strategy: labelStrategy,
    component: LabelDecorator(c),
  },
  {
    strategy: titleStrategy,
    component: TitleDecorator(c),
  },
  {
    strategy: docLinkStrategy,
    component: DocLinkDecorator(c),
  },
  {
    strategy: inlineImageStrategy,
    component: InlineImageDecorator(),
  },
  {
    strategy: linkStrategy,
    component: LinkDecorator(),
  },
  {
    strategy: newImageStrategy,
    component: NewImageDecorator(),
  },
  {
    strategy: checkboxStrategy,
    component: CheckboxDecorator(),
  },
])



export default compositeDecorator