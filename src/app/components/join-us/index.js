'use strict';

import React from 'react';
import classnames from 'classnames';
import find from 'lodash/collection/find';
import map from 'lodash/collection/map';
import filter from 'lodash/collection/filter';
import pluck from 'lodash/collection/pluck';
import includes from 'lodash/collection/includes';
import get from 'lodash/object/get';
import kebabCase from 'lodash/string/kebabCase';
import spannify from 'app/lib/spannify';
import getFeaturedImage from 'app/lib/get-featured-image';
import renderModules from 'app/lib/module-renderer';
import getScrollTrackerMixin from 'app/lib/get-scroll-tracker-mixin';

import DownChevron from 'app/components/down-chevron';
import SVG from 'app/components/svg';
import Hero from 'app/components/hero';
import StudioJobs from 'app/components/studio-jobs';
import JobsList from 'app/components/jobs-list';
import Rimage from 'app/components/rimage';
import Video from 'app/components/video';
import Flux from 'app/flux';

function getSelectedStudio(studioSlugFromUrl, studioSlugs) {
  let selected = 'london';
  if(includes(studioSlugs, studioSlugFromUrl)) {
    selected = studioSlugFromUrl;
  }
  return selected;
}

const PageJoinUs = React.createClass({
  mixins: [getScrollTrackerMixin('join-us')],
  render() {
    const { page, currentParams, studios } = this.props;
    const classes = classnames('page-join-us', this.props.className);
    const image = getFeaturedImage(page);
    const studioSlugFromUrl = get(currentParams, 'lid');
    const studioSlugs = map(pluck(studios, 'name'), kebabCase);
    const selectedStudioSlug = getSelectedStudio(studioSlugFromUrl, studioSlugs);

    return (
      <article className={classes}>
        <Hero
          title={get(page, 'display_title')}
          transitionImage={true}
          eventLabel='join-us'
          showDownChevron={true}
        >
          <Video
            src={get(page, 'featured_video')}
            sizes={get(image, 'media_details.sizes')}
          />
        </Hero>
        {renderModules({
          modules: get(page, 'page_builder', []),
          colours: get(page, 'colors'),
          zebra: false,
          placeholderContents: {
            WORKABLE_LIST: this.getJobSectionRenderer(selectedStudioSlug)
          }
        })}
      </article>
    );
  },
  componentDidUpdate() {
    let getActiveTab = React.findDOMNode(this.refs.activeTab);
    let getUnderline = React.findDOMNode(this.refs.underline);

    getUnderline.style.width = `${getActiveTab.offsetWidth}px`;
    getUnderline.style.left = `${getActiveTab.offsetLeft}px`;
  },
  handleClick() {
    let getStudioTabs = React.findDOMNode(this.refs.studioTabs);
    getStudioTabs.classList.remove('animate');
    setTimeout(() => {
      getStudioTabs.classList.add('animate')
    }, 0);
  },
  renderStudioTabs(selectedStudioSlug) {
    let studioSelectedBackgroundColor;
    const tabs = map(this.props.studios, studio => {
      let studioSelectedColor;
      const studioSlug = kebabCase(studio.name);
      const studioName = spannify(studio.name);
      const uri = `/join-us/${studioSlug}`;
      if (studioSlug === selectedStudioSlug) {
        studioSelectedColor = {color: studio.color}
        studioSelectedBackgroundColor = {backgroundColor: studio.color}
      }

      return (
        <div
          key={`tab-${studioSlug}`}
          aria-selected={studioSlug === selectedStudioSlug}
          className={`tab ${studioSlug} ${studioSlug === selectedStudioSlug ? 'active' : ''}`}
          ref={studioSlug === selectedStudioSlug ? 'activeTab' : ''}
          onClick={this.handleClick.bind(this)}
          style={studioSelectedColor}>
          <a
            href={uri}
            onClick={Flux.overrideNoScroll(uri)}>{studioName}</a>
        </div>
      );
    });

    return (
      <nav className="jobs-studio-tabs" ref="studioTabs">
        {tabs}
        <div className="underline" style={studioSelectedBackgroundColor} ref="underline"></div>
      </nav>
    );
  },
  getJobSectionRenderer(selectedStudioSlug) {

    return () => {
      const sizes = { hardcoded: { url: '/images/joinus/current_openings.jpg' }};

      return (
        <div key="job-section">
          <div className="current-openings">
            <h2>We're Hiring</h2>
          </div>
          <section className="jobs">
            {this.renderStudioTabs(selectedStudioSlug)}
            <div className="jobs-container">
              {this.renderStudioJobs(selectedStudioSlug)}
            </div>
          </section>
        </div>
      );
    };
  },
  renderStudioJobs(selectedStudioSlug) {
    return map(this.props.studios, studio => {
      const id = kebabCase(studio.name);
      const studioSlug = kebabCase(studio.name);
      const classes = classnames('studio-jobs', `${id}-jobs`, {
        selected: studioSlug === selectedStudioSlug
      });
      const image = getFeaturedImage(studio);
      return (
        <div className={classes}>
          <h3>{studio.name}</h3>
          <div className="tab-content" id={`tab-content-${id}`}>
            <div className="studio-info">
              <div className="info" style={{ backgroundColor: studio.color }}>
                <p className="excerpt">{get(studio, 'recruitment-title')}</p>
                <p className="studio-blurb">{get(studio, 'recruitment-desc')}</p>
              </div>
              <Rimage
                className="photo"
                wrap="div"
                sizes={get(image, 'media_details.sizes')}
                altText={get(image, 'alt_text')}
              />
            </div>
            <JobsList
              key={`jobs-${studioSlug}`}
              studio={studio}
              studios={this.props.studios}
              jobs={this.getJobsForStudio(studio)}
              contactEmail={get(find(get(find(get(this.props, 'footer.contacts', []), 'type', 'general'), 'methods', []), 'type', 'email'), 'uri', '')} />
          </div>
        </div>
      );
    });
  },
  getJobsForStudio(studio) {
    const allJobs = this.props.jobs || [];
    const { name } = studio;
    return filter(allJobs, job => {
      const studioMatchesCity = get(job, 'location.city', '') === name;
      const studioMatchesRegion = (get(job, 'location.region') || '').includes(name);
      return studioMatchesCity || studioMatchesRegion;
    });
  }
});

export default PageJoinUs;
