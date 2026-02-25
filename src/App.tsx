import React, { useState } from 'react';

interface RelatedApp {
  id?: string;
  platform: string;
  url?: string;
}

const App: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [relatedApps, setRelatedApps] = useState<RelatedApp[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(message);
  };

  const checkInstalledRelatedApps = async () => {
    try {
      if ('getInstalledRelatedApps' in navigator) {
        const apps = await (navigator as any).getInstalledRelatedApps();
        console.table(apps);
        setRelatedApps(apps);
        addLog(`Found ${apps.length} related app(s)`);
        apps.forEach((app: RelatedApp, index: number) => {
          addLog(`App ${index + 1}: platform=${app.platform}, id=${app.id || 'N/A'}, url=${app.url || 'N/A'}`);
        });
      } else {
        addLog('getInstalledRelatedApps API not supported in this browser');
      }
    } catch (error) {
      addLog(`Error checking related apps: ${error}`);
      console.error(error);
    }
  };

  const isMShop = (): boolean => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Check for android
    const isAndroid = userAgent.includes("android");
    
    // Check for mshop app
    const hasAppCookies =
      document.cookie.includes("amzn-app-id") ||
      document.cookie.includes("amzn-app-ctxt");
    
    addLog("document.cookie.includes('amzn-app-id'): " + document.cookie.includes("amzn-app-id"));
    addLog("document.cookie.includes('amzn-app-ctxt'): " + document.cookie.includes("amzn-app-ctxt"));
    
    const hasAppContext = (window as any).app && (window as any).app.ready;
    const hasAmazonMobileUA = userAgent.includes("amazon") && userAgent.includes("mobile");
    
    addLog(`isAndroid: ${isAndroid}`);
    addLog(`hasAppCookies: ${hasAppCookies}`);
    addLog(`hasAppContext: ${hasAppContext}`);
    addLog(`hasAmazonMobileUA: ${hasAmazonMobileUA}`);
    
    return hasAppCookies || hasAppContext || hasAmazonMobileUA;
  };

  const testMShop = () => {
    setLogs([]);
    const result = isMShop();
    
    if (result) {
      addLog("isMShop(): " + result + " - Would open in new window");
    } else {
      addLog("isMShop() else: " + result + " - Would open in new window");
    }
  };

  const setCookie = (name: string) => {
    document.cookie = `${name}=test-value; path=/`;
    addLog(`Cookie set: ${name}`);
  };

  const clearCookies = () => {
    document.cookie = "amzn-app-id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "amzn-app-ctxt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    addLog("Cookies cleared");
  };

  const setAppContext = () => {
    (window as any).app = { ready: true };
    addLog("window.app.ready set to true");
  };

  const clearAppContext = () => {
    delete (window as any).app;
    addLog("window.app cleared");
  };

  const PAYMENT_URL = "https://www.amazon.in/pay-checkout/payment-selection/v2?payCheckoutRequestId=acce4a14-d7bf-1632-de41-db1655cff0e6&ref=LPA_IN&ingressType=deepLink";

  // Detect if running on iPhone
  const isIPhone = (): boolean => {
    return /iPhone/i.test(navigator.userAgent);
  };

  // Detect if running in Instagram webview
  const isInstagramWebview = (): boolean => {
    return /Instagram/i.test(navigator.userAgent);
  };

  // Approach 1: googlechrome:// scheme (CONFIRMED WORKING)
  const openViaChromeScheme = () => {
    addLog("Approach 1: googlechrome:// scheme");
    const chromeUrl = PAYMENT_URL.replace('https://', 'googlechrome://');
    addLog("Chrome URL: " + chromeUrl);
    window.location.href = chromeUrl;
  };

  // Approach 1b: x-safari-https scheme (com.apple.mobilesafari)
  const openViaSafariTabScheme = () => {
    const safariUrl = `x-web-search://com-apple-mobilesafari-tab:${PAYMENT_URL}`;
    addLog("Approach 1b: com-apple-mobilesafari-tab scheme");
    addLog("Safari URL: " + safariUrl);
    window.location.href = safariUrl;
  };

  // Approach 1c: Direct com-apple-mobilesafari-tab
  const openViaSafariTabDirect = () => {
    const safariUrl = `com-apple-mobilesafari-tab:${PAYMENT_URL}`;
    addLog("Approach 1c: com-apple-mobilesafari-tab: direct");
    addLog("Safari URL: " + safariUrl);
    window.location.href = safariUrl;
  };

  // Approach 1d: x-safari-https:// scheme
  const openViaXSafariHttps = () => {
    const safariUrl = `x-safari-https://${PAYMENT_URL.replace('https://', '')}`;
    addLog("Approach 1d: x-safari-https:// via location.href");
    addLog("Safari URL: " + safariUrl);
    window.location.href = safariUrl;
  };

  // Approach 1e: x-safari- with window.open (iOS 17+ confirmed working)
  const openViaXSafariWindowOpen = () => {
    const safariUrl = `x-safari-${PAYMENT_URL}`;
    addLog("Approach 1e: x-safari- via window.open(_blank)");
    addLog("Safari URL: " + safariUrl);
    window.open(safariUrl, "_blank");
  };

  // Approach 1f: plain window.open
  const openViaWindowOpen = () => {
    addLog("Approach 1f: window.open(_blank)");
    addLog("URL: " + PAYMENT_URL);
    window.open(PAYMENT_URL, "_blank");
  };


  // Approach 3: Blob HTML download with meta refresh redirect
  const openViaBlobHtmlRedirect = () => {
    addLog("Approach 3: Blob HTML with meta refresh redirect");
    const html = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=${PAYMENT_URL}"><title>Redirecting...</title></head><body><a href="${PAYMENT_URL}">Click here if not redirected</a></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = 'payment.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    addLog("HTML blob download triggered");
  };

  // Approach 4: Anchor with download attribute (no blob)
  const openViaDownloadAttr = () => {
    addLog("Approach 4: Anchor with download attribute");
    const a = document.createElement('a');
    a.href = PAYMENT_URL;
    a.download = '';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    addLog("Download anchor clicked");
  };

  // Approach 5: googlechromes:// (for https URLs specifically)
  const openViaChromeSecureScheme = () => {
    addLog("Approach 5: googlechromes:// scheme (secure)");
    const chromeUrl = PAYMENT_URL.replace('https://', 'googlechromes://');
    addLog("Chrome secure URL: " + chromeUrl);
    window.location.href = chromeUrl;
  };

  // Approach 6: Create a PDF blob download (iOS opens PDFs in Safari)
  const openViaPdfTrick = () => {
    addLog("Approach 6: PDF blob trick");
    // Minimal PDF that redirects - iOS will try to open in Safari/Preview
    const pdfContent = `%PDF-1.0
1 0 obj<</Type/Catalog/Pages 2 0 R/OpenAction<</S/URI/URI(${PAYMENT_URL})>>>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj
xref
0 4
trailer<</Size 4/Root 1 0 R>>
startxref
0
%%EOF`;
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = 'payment.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    addLog("PDF blob download triggered");
  };

  // Approach 7: window.open with blob URL
  const openViaWindowOpenBlob = () => {
    addLog("Approach 7: window.open with blob URL");
    const html = `<!DOCTYPE html><html><head><script>window.location.href='${PAYMENT_URL}';</script></head><body></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
    addLog("Blob URL opened via window.open");
  };

  // Approach 8: Fetch + blob download (server-like Content-Disposition trick)
  const openViaFetchDownload = () => {
    addLog("Approach 8: Fetch + blob download trick");
    fetch(PAYMENT_URL, { mode: 'no-cors' })
      .then(() => {
        // Even if fetch fails due to CORS, trigger a download
        const a = document.createElement('a');
        a.href = PAYMENT_URL;
        a.setAttribute('download', '');
        a.setAttribute('target', '_blank');
        a.type = 'application/octet-stream';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        addLog("Fetch download triggered");
      })
      .catch(err => {
        addLog("Fetch error (expected): " + err);
        // Fallback: try direct download
        window.location.href = PAYMENT_URL;
      });
  };

  // Approach 9: Create iframe with srcdoc containing redirect
  const openViaIframeSrcdoc = () => {
    addLog("Approach 9: iframe srcdoc redirect");
    const iframe = document.createElement('iframe');
    iframe.srcdoc = `<html><head><meta http-equiv="refresh" content="0;url=${PAYMENT_URL}"></head></html>`;
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    addLog("iframe srcdoc added");
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 3000);
  };

  // Approach 10: navigator.share API (opens native share sheet, user picks Safari)
  const openViaShareApi = () => {
    addLog("Approach 10: navigator.share API");
    if (navigator.share) {
      navigator.share({
        title: 'Complete Payment',
        url: PAYMENT_URL,
      }).then(() => {
        addLog("Share dialog opened");
      }).catch(err => {
        addLog("Share error: " + err);
      });
    } else {
      addLog("navigator.share not supported");
    }
  };

  const openPaymentUrl = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isAndroid = userAgent.includes("android");
    
    addLog("Opening payment URL...");
    
    if (isAndroid) {
      const intentUrl = `intent://${PAYMENT_URL.replace('https://', '')}#Intent;scheme=https;action=android.intent.action.VIEW;end`;
      addLog("Opening via Android intent:// scheme...");
      window.location.href = intentUrl;
    } else {
      addLog("Opening payment URL with window.open...");
      window.open(PAYMENT_URL, "_blank");
    }
  };

  const openPaymentUrlWindowOpen = () => {
    const paymentUrl = "https://in-development.amazon.com/lpa/kux/dl/redirect/initiatePayment?iv=qyJ4irT0YwVtuQOS%2FIfYHQ%3D%3D&key=Vs4RRuFt2OISoKJF4V5%2BdKxcTb%2FsyJAcQWxMbuV3uwOGccPTSTMVfIvVAyLvmlamHx9CaT6SQPy%2FCwMeK5zULqAHhND4ukSONB02NRI8I1Hdv5a9YZKbsqRg%2F29ufX66%2FeMo8kYnDf0axMsXUhDvRHe1QWAy1notkK5YlUNL%2BnI%3D&payload=FqSrxvpm32%2FhRwDtEXXltXit0jMmexUCcqJhXygQ44YDC9hv9UGXos0hZCilQZGvW7HREMdmDHFrlE1Pyk4RpPp%2BgtqN7WbCFU59poPO1xRI%2B1heTJLjV5QBqCGjfK2h6KHYsGaWa%2FaHsEp42zweVpgY13VKDfaTgVBLKdtHxf0OX3P8cVd4u5zBSWzLRzIjq2U9XF%2Bt4KQKEHe0Ld07Utbej%2BJzi0c%2FhH%2BTixqwRjMs70Bj12vO5TYPG2EXQJrO0jipRXP7q%2BkNATe9Yko%2FfyGicrjUWWffNHre2hKRz6kEDgHOOvkeAHjAfFKRF5DtegmidLb0NwHVJbdPB4gR6T2acSnEIo%2F%2FFeGw6h9iaySMwEv2NqCe052hUNlK7lheLUJxSgTMhsoizTs%2FODRw%2B7gvVtVY4xNAgZKISATtGynp28PjcKUrNrl2bOi1IZLUIJnt%2BuFCUpWdeJrTKbWPVZ1wVQgKu3AUEY6iYOLz2926aUk0DWRPi29Wivg%3D&redirectUrl=https%3A%2F%2Fbeta.smartbiz.in%2Fcressida%2Fpayments%2F5292419789955215%2Fsuccess&ingressType=deepLink";
    addLog("Opening payment URL with window.open _blank...");
    window.open(paymentUrl, "_blank");
  };

  const openAmazonMShopApp = () => {
    addLog("Attempting to open Amazon MShop app...");
    // Intent to open Amazon Shopping app (India) directly
    const intentUrl = "intent://www.amazon.in#Intent;scheme=https;package=in.amazon.mShop.android.shopping;S.browser_fallback_url=https://www.amazon.in;end";
    window.location.href = intentUrl;
  };

  const openPaymentInAmazonApp = () => {
    const paymentUrl = "https://amazon.in/pay-checkout/payment-selection/v2?payCheckoutRequestId=1acdc6ce-4474-820b-a268-882cc2585792&ingressType=deepLink";
    
    // Wrap payment URL in intent with Amazon app package
    const intentUrl = `intent://${paymentUrl.replace('https://', '')}#Intent;scheme=https;package=in.amazon.mShop.android.shopping;S.browser_fallback_url=${encodeURIComponent(paymentUrl)};end`;
    addLog("Opening payment URL in Amazon MShop app via intent...");
    addLog("Intent URL: " + intentUrl);
    window.location.href = intentUrl;
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>MShop Detection Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Current State</h3>
        <p><strong>User Agent:</strong> {navigator.userAgent}</p>
        <p><strong>Cookies:</strong> {document.cookie || '(none)'}</p>
        <p><strong>window.app:</strong> {JSON.stringify((window as any).app) || '(undefined)'}</p>
        <p><strong>iPhone:</strong> {isIPhone() ? '✅ YES' : '❌ NO'}</p>
        <p><strong>Instagram Webview:</strong> {isInstagramWebview() ? '✅ YES' : '❌ NO'}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>iOS Instagram → External Browser Approaches</h3>
        <p style={{ color: '#666', fontSize: '14px' }}>Test methods to escape Instagram webview on iPhone</p>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
          <button onClick={openViaChromeScheme} style={{ ...buttonStyle, backgroundColor: '#4285F4', color: 'white' }}>
            1. googlechrome:// ✅
          </button>
          <button onClick={openViaSafariTabScheme} style={{ ...buttonStyle, backgroundColor: '#007AFF', color: 'white' }}>
            1b. x-web-search://com-apple-mobilesafari-tab
          </button>
          <button onClick={openViaSafariTabDirect} style={{ ...buttonStyle, backgroundColor: '#34C759', color: 'white' }}>
            1c. com-apple-mobilesafari-tab:
          </button>
          <button onClick={openViaXSafariHttps} style={{ ...buttonStyle, backgroundColor: '#FF9500', color: 'white' }}>
            1d. x-safari-https:// (location)
          </button>
          <button onClick={openViaXSafariWindowOpen} style={{ ...buttonStyle, backgroundColor: '#AF52DE', color: 'white' }}>
            1e. x-safari- window.open ⭐
          </button>
          <button onClick={openViaWindowOpen} style={{ ...buttonStyle, backgroundColor: '#007bff', color: 'white' }}>
            1f. window.open
          </button>
          <button onClick={openViaBlobHtmlRedirect} style={{ ...buttonStyle, backgroundColor: '#28a745', color: 'white' }}>
            3. Blob HTML + meta refresh
          </button>
          <button onClick={openViaDownloadAttr} style={{ ...buttonStyle, backgroundColor: '#fd7e14', color: 'white' }}>
            4. Anchor download attr
          </button>
          <button onClick={openViaChromeSecureScheme} style={{ ...buttonStyle, backgroundColor: '#0d6efd', color: 'white' }}>
            5. googlechromes://
          </button>
          <button onClick={openViaPdfTrick} style={{ ...buttonStyle, backgroundColor: '#6f42c1', color: 'white' }}>
            6. PDF blob trick
          </button>
          <button onClick={openViaWindowOpenBlob} style={{ ...buttonStyle, backgroundColor: '#343a40', color: 'white' }}>
            7. window.open blob
          </button>
          <button onClick={openViaFetchDownload} style={{ ...buttonStyle, backgroundColor: '#17a2b8', color: 'white' }}>
            8. Fetch + download
          </button>
          <button onClick={openViaIframeSrcdoc} style={{ ...buttonStyle, backgroundColor: '#6c757d', color: 'white' }}>
            9. iframe srcdoc
          </button>
          <button onClick={openViaShareApi} style={{ ...buttonStyle, backgroundColor: '#198754', color: 'white' }}>
            10. navigator.share
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Other Actions</h3>
        {/* <button onClick={testMShop} style={{ ...buttonStyle, backgroundColor: '#007bff', color: 'white', fontSize: '16px', padding: '12px 24px' }}>
          Run isMShop() Test
        </button> */}
       
        <button onClick={() => { setLogs([]); setRelatedApps([]); }} style={{ ...buttonStyle, marginLeft: '10px' }}>
          Clear Logs
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={openPaymentUrl} style={{ ...buttonStyle, backgroundColor: '#ff9900', color: 'white', fontSize: '16px', padding: '12px 24px' }}>
          Open Payment (Intent://)
        </button>
        <button onClick={openPaymentUrlWindowOpen} style={{ ...buttonStyle, backgroundColor: '#dc3545', color: 'white', fontSize: '16px', padding: '12px 24px', marginLeft: '10px' }}>
          Open Payment (window.open)
        </button>
        <button onClick={openAmazonMShopApp} style={{ ...buttonStyle, backgroundColor: '#232f3e', color: 'white', fontSize: '16px', padding: '12px 24px', marginLeft: '10px' }}>
          Open Amazon MShop App
        </button>
        <button onClick={openPaymentInAmazonApp} style={{ ...buttonStyle, backgroundColor: '#146eb4', color: 'white', fontSize: '16px', padding: '12px 24px', marginLeft: '10px' }}>
          Open Payment in Amazon App
        </button>
      </div>

      {relatedApps.length > 0 && (
        <div style={{ marginBottom: '20px', overflowX: 'auto' }}>
          <h3>Related Apps</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#f9f9f9' }}>
            <thead>
              <tr style={{ backgroundColor: '#333', color: 'white' }}>
                <th style={tableCell}>Platform</th>
                <th style={tableCell}>ID</th>
                <th style={tableCell}>URL</th>
              </tr>
            </thead>
            <tbody>
              {relatedApps.map((app, i) => (
                <tr key={i}>
                  <td style={tableCell}>{app.platform}</td>
                  <td style={tableCell}>{app.id || 'N/A'}</td>
                  <td style={tableCell}>{app.url || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ backgroundColor: '#1e1e1e', color: '#00ff00', padding: '15px', borderRadius: '5px', minHeight: '200px' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#fff' }}>Console Output</h3>
        {logs.length === 0 ? (
          <p style={{ color: '#888' }}>Click "Run isMShop() Test" to see logs...</p>
        ) : (
          logs.map((log, i) => <div key={i} style={{ marginBottom: '5px' }}>{log}</div>)
        )}
      </div>
    </div>
  );
};

const buttonStyle: React.CSSProperties = {
  padding: '8px 16px',
  cursor: 'pointer',
  borderRadius: '4px',
  border: '1px solid #ccc',
  backgroundColor: '#f0f0f0',
};

const tableCell: React.CSSProperties = {
  padding: '10px',
  border: '1px solid #ddd',
  textAlign: 'left',
};

export default App;
