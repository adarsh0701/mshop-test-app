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

  const PAYMENT_URL = "https://in-development.amazon.com/pay-checkout/";

  // Detect if running on iPhone
  const isIPhone = (): boolean => {
    return /iPhone/i.test(navigator.userAgent);
  };

  // Detect if running in Instagram webview
  const isInstagramWebview = (): boolean => {
    return /Instagram/i.test(navigator.userAgent);
  };

  // Approach 1: window.open with _blank
  const openViaWindowOpen = () => {
    addLog("Approach 1: window.open(_blank)");
    const result = window.open(PAYMENT_URL, "_blank");
    addLog(result ? "Window opened (or popup blocked)" : "window.open returned null");
  };

  // Approach 2: window.location.href
  const openViaLocationHref = () => {
    addLog("Approach 2: window.location.href");
    window.location.href = PAYMENT_URL;
  };

  // Approach 3: window.location.assign
  const openViaLocationAssign = () => {
    addLog("Approach 3: window.location.assign");
    window.location.assign(PAYMENT_URL);
  };

  // Approach 4: window.location.replace
  const openViaLocationReplace = () => {
    addLog("Approach 4: window.location.replace");
    window.location.replace(PAYMENT_URL);
  };

  // Approach 5: Create anchor tag and click
  const openViaAnchorClick = () => {
    addLog("Approach 5: Create <a> tag and click");
    const a = document.createElement('a');
    a.href = PAYMENT_URL;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    addLog("Anchor clicked");
  };

  // Approach 6: Create anchor with _system target (Cordova style)
  const openViaAnchorSystem = () => {
    addLog("Approach 6: Create <a> with _system target");
    const a = document.createElement('a');
    a.href = PAYMENT_URL;
    a.target = '_system';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    addLog("Anchor with _system clicked");
  };

  // Approach 7: Using googlechrome:// scheme
  const openViaChromeScheme = () => {
    addLog("Approach 7: googlechrome:// scheme");
    const chromeUrl = PAYMENT_URL.replace('https://', 'googlechrome://');
    addLog("Chrome URL: " + chromeUrl);
    window.location.href = chromeUrl;
  };

  // Approach 8: Try multiple Safari-related schemes
  const openViaSafariScheme = () => {
    addLog("Approach 8: Trying x-safari://");
    window.location.href = `x-safari://${PAYMENT_URL}`;
  };

  // Approach 8b: Long press link overlay (most reliable for iOS Instagram)
  const openViaSafari8b = () => {
    addLog("Approach 8b: Showing long-press link overlay");
    const overlay = document.createElement('div');
    overlay.id = 'safari-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.95);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;';
    overlay.innerHTML = `
      <p style="color:white;font-size:18px;text-align:center;margin-bottom:20px;font-weight:bold;">To open in Safari:</p>
      <p style="color:#aaa;font-size:14px;text-align:center;margin-bottom:20px;">Long press the link below → Select "Open in Safari"</p>
      <a href="${PAYMENT_URL}" style="color:#007AFF;font-size:14px;word-break:break-all;text-align:center;padding:15px;background:white;border-radius:10px;max-width:90%;display:block;">${PAYMENT_URL.substring(0, 50)}...</a>
      <button onclick="document.getElementById('safari-overlay').remove()" style="margin-top:30px;padding:12px 40px;font-size:16px;border-radius:8px;border:none;background:#ff3b30;color:white;">Close</button>
    `;
    document.body.appendChild(overlay);
  };

  // Approach 8e: Try safari-https:// scheme
  const openViaSafari8e = () => {
    addLog("Approach 8e: safari-https:// scheme");
    window.location.href = `safari-https://${PAYMENT_URL.replace('https://', '')}`;
  };

  // Approach 9: Using hidden iframe
  const openViaIframe = () => {
    addLog("Approach 9: Hidden iframe");
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = PAYMENT_URL;
    document.body.appendChild(iframe);
    addLog("Iframe added to DOM");
    setTimeout(() => {
      document.body.removeChild(iframe);
      addLog("Iframe removed");
    }, 3000);
  };

  // Approach 11: Using window.open with specific features
  const openViaWindowOpenFeatures = () => {
    addLog("Approach 11: window.open with features");
    const features = 'location=yes,height=570,width=520,scrollbars=yes,status=yes';
    const result = window.open(PAYMENT_URL, '_blank', features);
    addLog(result ? "Window opened with features" : "window.open returned null");
  };

  // Approach 12: Meta refresh redirect
  const openViaMetaRefresh = () => {
    addLog("Approach 12: Meta refresh redirect");
    const meta = document.createElement('meta');
    meta.httpEquiv = 'refresh';
    meta.content = `0;url=${PAYMENT_URL}`;
    document.head.appendChild(meta);
    addLog("Meta refresh tag added");
  };

  // Approach 15: Try using a redirect service/intermediate page
  const openViaRedirectTrick = () => {
    addLog("Approach 15: Blob URL redirect trick");
    const html = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=${PAYMENT_URL}"></head><body><a href="${PAYMENT_URL}">Click here</a></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const blobUrl = URL.createObjectURL(blob);
    addLog("Blob URL created: " + blobUrl);
    window.open(blobUrl, '_blank');
  };

  // Approach 16: window.open with _top target (escape iframe if any)
  const openViaWindowTop = () => {
    addLog("Approach 16: window.open with _top");
    window.open(PAYMENT_URL, '_top');
  };

  // Approach 17: Assign to top.location
  const openViaTopLocation = () => {
    addLog("Approach 17: top.location.href");
    try {
      top!.location.href = PAYMENT_URL;
    } catch (e) {
      addLog("top.location blocked: " + e);
      window.location.href = PAYMENT_URL;
    }
  };

  // Approach 18: Using intent:// on iOS (Android style, won't work but testing)
  const openViaIntentIOS = () => {
    addLog("Approach 18: intent:// scheme on iOS");
    const intentUrl = `intent://${PAYMENT_URL.replace('https://', '')}#Intent;scheme=https;action=android.intent.action.VIEW;end`;
    addLog("Intent URL: " + intentUrl);
    window.location.href = intentUrl;
  };

  // Approach 19: Open Safari via apple-mobilesafari-tab scheme (undocumented)
  const openViaSafariTab = () => {
    addLog("Approach 19: apple-mobilesafari-tab:// (undocumented)");
    window.location.href = `apple-mobilesafari-tab://${PAYMENT_URL}`;
  };

  // Approach 20: Try triggering download behavior
  const openViaDownloadTrigger = () => {
    addLog("Approach 20: Download attribute trigger");
    const a = document.createElement('a');
    a.href = PAYMENT_URL;
    a.download = '';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Approach 21: Using data URI redirect
  const openViaDataUri = () => {
    addLog("Approach 21: data: URI redirect");
    const dataUri = `data:text/html,<script>window.location='${PAYMENT_URL}'</script>`;
    window.location.href = dataUri;
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
        <h3>iOS Instagram External Browser Approaches</h3>
        <p style={{ color: '#666', fontSize: '14px' }}>Test different methods to open URL in external browser from Instagram webview on iPhone</p>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
          <button onClick={openViaWindowOpen} style={{ ...buttonStyle, backgroundColor: '#007bff', color: 'white' }}>
            1. window.open(_blank)
          </button>
          <button onClick={openViaLocationHref} style={{ ...buttonStyle, backgroundColor: '#28a745', color: 'white' }}>
            2. location.href
          </button>
          <button onClick={openViaLocationAssign} style={{ ...buttonStyle, backgroundColor: '#17a2b8', color: 'white' }}>
            3. location.assign
          </button>
          <button onClick={openViaLocationReplace} style={{ ...buttonStyle, backgroundColor: '#ffc107', color: 'black' }}>
            4. location.replace
          </button>
          <button onClick={openViaAnchorClick} style={{ ...buttonStyle, backgroundColor: '#dc3545', color: 'white' }}>
            5. Anchor click (_blank)
          </button>
          <button onClick={openViaAnchorSystem} style={{ ...buttonStyle, backgroundColor: '#6f42c1', color: 'white' }}>
            6. Anchor (_system)
          </button>
          <button onClick={openViaChromeScheme} style={{ ...buttonStyle, backgroundColor: '#fd7e14', color: 'white' }}>
            7. googlechrome://
          </button>
          <button onClick={openViaSafariScheme} style={{ ...buttonStyle, backgroundColor: '#20c997', color: 'white' }}>
            8. x-safari://
          </button>
          <button onClick={openViaSafari8b} style={{ ...buttonStyle, backgroundColor: '#0d6efd', color: 'white' }}>
            8b. Long-press link
          </button>
          <button onClick={openViaSafari8e} style={{ ...buttonStyle, backgroundColor: '#fd7e14', color: 'white' }}>
            8e. safari-https://
          </button>
          <button onClick={openViaIframe} style={{ ...buttonStyle, backgroundColor: '#6c757d', color: 'white' }}>
            9. Hidden iframe
          </button>
          <button onClick={openViaWindowOpenFeatures} style={{ ...buttonStyle, backgroundColor: '#343a40', color: 'white' }}>
            11. window.open(features)
          </button>
          <button onClick={openViaMetaRefresh} style={{ ...buttonStyle, backgroundColor: '#795548', color: 'white' }}>
            12. Meta refresh
          </button>
          <button onClick={openViaRedirectTrick} style={{ ...buttonStyle, backgroundColor: '#6610f2', color: 'white' }}>
            15. Blob redirect
          </button>
          <button onClick={openViaWindowTop} style={{ ...buttonStyle, backgroundColor: '#d63384', color: 'white' }}>
            16. window.open(_top)
          </button>
          <button onClick={openViaTopLocation} style={{ ...buttonStyle, backgroundColor: '#ab47bc', color: 'white' }}>
            17. top.location.href
          </button>
          <button onClick={openViaIntentIOS} style={{ ...buttonStyle, backgroundColor: '#ff7043', color: 'white' }}>
            18. intent:// (iOS test)
          </button>
          <button onClick={openViaSafariTab} style={{ ...buttonStyle, backgroundColor: '#26a69a', color: 'white' }}>
            19. apple-mobilesafari-tab://
          </button>
          <button onClick={openViaDownloadTrigger} style={{ ...buttonStyle, backgroundColor: '#5c6bc0', color: 'white' }}>
            20. Download trigger
          </button>
          <button onClick={openViaDataUri} style={{ ...buttonStyle, backgroundColor: '#8d6e63', color: 'white' }}>
            21. data: URI
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
