import {Suspense} from 'react';
import {Await, NavLink} from 'react-router';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';
import {CountrySelector} from './CountrySelector';
import {LocalizedLink} from './LocalizedLink';
import type {I18nLocale} from '~/lib/i18n';

interface FooterProps {
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
  currentLocale: I18nLocale;
}

export function Footer({
  footer: footerPromise,
  header,
  publicStoreDomain,
  currentLocale,
}: FooterProps) {
  return (
    <Suspense>
      <Await resolve={footerPromise}>
        {(footer) => (
          <footer className="py-1 relative z-20 800:py-0 bg-brand-liteblue h-[calc(100dvh-40px)]">
            <div className="h-[calc(100%-60px)]">
              <div className="h-full flex justify-center items-center p-4 ">
                <div className="grid grid-cols-1 1200:grid-cols-3  items-center justify-between w-full gap-y-10 gap-4 max-w-[1200px] mx-auto">
                  <div className="flex flex-col 1200:flex-row items-center justify-between gap-4">
                    <a
                      href="https://sanity.io"
                      className="border inline-block rounded-[30px] border-black p-2 px-4 uppercase"
                    >
                      Sanity.io
                    </a>
                    <ul className="flex items-center gap-3">
                      <li>
                        <a href="https://github.com/sanity-io">
                          <img src="/images/github.svg" />
                        </a>
                      </li>
                      <li>
                        <a href="https://www.youtube.com/@sanity_io">
                          <img src="/images/youtube.svg" />
                        </a>
                      </li>
                      <li>
                        <a href="https://www.linkedin.com/company/sanity-io">
                          <img src="/images/linkedin.svg" />
                        </a>
                      </li>
                      <li>
                        <a href="https://bsky.app/profile/sanity.io">
                          <img src="/images/bluesky.svg" />
                        </a>
                      </li>
                      <li>
                        <a href="https://x.com/sanity_io">
                          <img src="/images/x.svg" />
                        </a>
                      </li>
                      <li>
                        <a href="https://www.sanity.io/feed/rss">
                          <img src="/images/rss.svg" />
                        </a>
                      </li>
                      <li>
                        <a href="https://snty.link/community">
                          <img src="/images/discord.svg" />
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div className="flex justify-center 800:my-10">
                    <img src="/images/footer-logo.svg" />
                  </div>
                  <div className="p-4">
                    <div className="flex flex-col 1400:flex-row justify-center text-center items-center gap-2 max-w-[300px] mx-auto">
                      <span className="text-24 font-sans text-black w-full min-w-[350px]">
                        Join our community newsletter
                      </span>

                      <LocalizedLink
                        to="/subscribe"
                        className="border inline-block rounded-[30px] border-black p-2 px-4 uppercase"
                      >
                        SUBSCRIBE
                      </LocalizedLink>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {footer?.menu && header.shop.primaryDomain?.url && (
              <FooterMenu
                menu={footer.menu}
                primaryDomainUrl={header.shop.primaryDomain.url}
                publicStoreDomain={publicStoreDomain}
                currentLocale={currentLocale}
              />
            )}
          </footer>
        )}
      </Await>
    </Suspense>
  );
}

function FooterMenu({
  menu,
  primaryDomainUrl,
  publicStoreDomain,
  currentLocale,
}: {
  menu: FooterQuery['menu'];
  primaryDomainUrl: FooterProps['header']['shop']['primaryDomain']['url'];
  publicStoreDomain: string;
  currentLocale: I18nLocale;
}) {
  return (
    <nav
      className="footer-menu uppercase text-black p-4 flex flex-col 800:flex-row pb-2 800:pb-0 justify-between"
      role="navigation"
    >
      <div className="flex items-center gap-12">
        {FALLBACK_FOOTER_MENU.items.map((item) => {
          if (!item.url) return null;
          // if the url is internal, we strip the domain
          const url =
            item.url.includes('myshopify.com') ||
            item.url.includes(publicStoreDomain) ||
            item.url.includes(primaryDomainUrl)
              ? new URL(item.url).pathname
              : item.url;
          const isExternal = !url.startsWith('/');
          return isExternal ? (
            <a
              href={url}
              key={item.id}
              rel="noopener noreferrer text-black"
              target="_blank"
            >
              {item.title}
            </a>
          ) : (
            <LocalizedLink key={item.id} to={url}>
              {item.title}
            </LocalizedLink>
          );
        })}
      </div>
      <div className="flex items-center gap-4">
        <CountrySelector currentLocale={currentLocale} />
        <span>Sanity &copy; {new Date().getFullYear()}</span>
      </div>
    </nav>
  );
}

const FALLBACK_FOOTER_MENU = {
  id: 'gid://shopify/Menu/199655620664',
  items: [
    {
      id: 'gid://shopify/MenuItem/461633060920',
      resourceId: 'gid://shopify/ShopPolicy/23358046264',
      tags: [],
      title: 'Privacy Policy',
      type: 'SHOP_POLICY',
      url: '/policies/privacy-policy',
      items: [],
    },
    // {
    //   id: 'gid://shopify/MenuItem/461633093688',
    //   resourceId: 'gid://shopify/ShopPolicy/23358013496',
    //   tags: [],
    //   title: 'Refund Policy',
    //   type: 'SHOP_POLICY',
    //   url: '/policies/refund-policy',
    //   items: [],
    // },
    // {
    //   id: 'gid://shopify/MenuItem/461633126456',
    //   resourceId: 'gid://shopify/ShopPolicy/23358111800',
    //   tags: [],
    //   title: 'Shipping Policy',
    //   type: 'SHOP_POLICY',
    //   url: '/policies/shipping-policy',
    //   items: [],
    // },
    {
      id: 'gid://shopify/MenuItem/461633159224',
      resourceId: 'gid://shopify/ShopPolicy/23358079032',
      tags: [],
      title: 'Terms of Service',
      type: 'SHOP_POLICY',
      url: '/policies/terms-of-service',
      items: [],
    },
  ],
};
