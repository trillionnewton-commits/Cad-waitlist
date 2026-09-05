(function(){
  'use strict';
  var openSignup = null;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if(!reduce){
    var tt0 = document.getElementById('type-target');
    if(tt0){ tt0.textContent = ''; }
    document.querySelectorAll('[data-count]').forEach(function(el){ el.textContent = '0'; });
  }

  /* ---- loader ---- */
  var loader = document.getElementById('loader');
  window.setTimeout(function(){ document.documentElement.classList.add('anim-done'); if(loader && loader.parentNode){ loader.parentNode.removeChild(loader); } }, reduce ? 50 : 1450);

  /* ---- scroll progress ---- */
  var progress = document.getElementById('progress');
  var ticking = false;
  function updateProgress(){
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    progress.style.transform = 'scaleX(' + (max > 0 ? (h.scrollTop || document.body.scrollTop) / max : 0) + ')';
    ticking = false;
  }
  window.addEventListener('scroll', function(){
    if(!ticking){ ticking = true; requestAnimationFrame(updateProgress); }
  }, {passive:true});
  updateProgress();

  /* ---- story timeline fill ---- */
  var storyEl = document.getElementById('story');
  var sFill = document.getElementById('s-fill');
  if(storyEl && sFill){
    var sTicking = false;
    function updStory(){
      sTicking = false;
      var r = storyEl.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var passed = Math.min(Math.max(vh * 0.6 - r.top, 0), r.height);
      var p = r.height > 0 ? passed / r.height : 0;
      storyEl.style.setProperty('--sfp', p.toFixed(4));
      var dots = storyEl.querySelectorAll('.s-dot');
      var th = [0.01, 0.5, 0.995];
      dots.forEach(function(d, i){
        d.classList.toggle('lit', p >= th[i]);
      });
    }
    window.addEventListener('scroll', function(){
      if(!sTicking){ sTicking = true; requestAnimationFrame(updStory); }
    }, {passive:true});
    window.addEventListener('resize', updStory);
    updStory();
  }

  /* ---- reveal on scroll ---- */
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(en.isIntersecting){
        en.target.classList.add('in');
        io.unobserve(en.target);
        if(en.target.hasAttribute('data-count')){ countUp(en.target); }
        en.target.querySelectorAll('[data-count]').forEach(function(c){ countUp(c); });
      }
    });
  }, {threshold:.12, rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });

  /* ---- count-up ---- */
  function countUp(el){
    if(el.hasAttribute('data-counted')){ return; }
    el.setAttribute('data-counted', '1');
    var target = parseInt(el.getAttribute('data-count'), 10);
    var comma = el.getAttribute('data-comma') === '1';
    if(reduce){ el.textContent = comma ? target.toLocaleString('en-US') : target; return; }
    var dur = 1300, start = null;
    function step(ts){
      if(!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 4);
      var val = Math.round(target * eased);
      el.textContent = comma ? val.toLocaleString('en-US') : val;
      if(p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---- funnel fill + counters + typing (hero sequence) ---- */
  var filled = false;
  function runHeroSequence(){
    if(filled) return; filled = true;
    var mb = document.querySelector('.mock-body');
    if(mb){ mb.classList.add('go'); }
    var bars = document.querySelectorAll('.frow .track i');
    var nums = document.querySelectorAll('.mstat [data-count], .funnel [data-count]');
    bars.forEach(function(el, i){
      setTimeout(function(){
        el.style.width = el.getAttribute('data-w') + '%';
        el.style.setProperty('--w', el.getAttribute('data-w') + '%');
      }, reduce ? 0 : 300 + i * 160);
    });
    setTimeout(function(){ nums.forEach(countUp); }, reduce ? 0 : 500);
    setTimeout(typeAgent, reduce ? 0 : 2400);
  }
  window.addEventListener('load', function(){ setTimeout(runHeroSequence, reduce ? 0 : 900); });
  setTimeout(runHeroSequence, 3200);

  /* ---- agent typing ---- */
  var typed = false;
  function typeAgent(){
    if(typed) return; typed = true;
    var target = document.getElementById('type-target');
    var cursor = document.getElementById('type-cursor');
    if(!target) return;
    var text = '63% of carts die at the shipping step. Decision: show delivery cost on the product page — recover that leak.';
    if(reduce){ target.textContent = text; if(cursor) cursor.style.display = 'none'; return; }
    var i = 0;
    (function tick(){
      if(i <= text.length){
        target.textContent = text.slice(0, i);
        i += 1;
        setTimeout(tick, 14);
      } else if(cursor){
        setTimeout(function(){ cursor.style.display = 'none'; }, 2400);
      }
    })();
  }

  /* ---- 3D tilt on mockup ---- */
  var wrap = document.getElementById('tilt-wrap');
  var mock = document.getElementById('mock');
  if(wrap && mock && fine && !reduce){
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    function loop(){
      cx += (tx - cx) * 0.09;
      cy += (ty - cy) * 0.09;
      mock.style.transform = 'rotateY(' + cx.toFixed(2) + 'deg) rotateX(' + cy.toFixed(2) + 'deg)';
      if(Math.abs(tx - cx) > 0.02 || Math.abs(ty - cy) > 0.02){ raf = requestAnimationFrame(loop); } else { raf = null; }
    }
    wrap.addEventListener('mousemove', function(e){
      var r = wrap.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 9;
      ty = -((e.clientY - r.top) / r.height - 0.5) * 7;
      if(!raf) raf = requestAnimationFrame(loop);
    });
    wrap.addEventListener('mouseleave', function(){
      tx = 0; ty = 0;
      if(!raf) raf = requestAnimationFrame(loop);
    });
  }

  /* ---- magnetic buttons ---- */
  if(fine && !reduce){
    document.querySelectorAll('.magnetic').forEach(function(btn){
      btn.addEventListener('mousemove', function(e){
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) / r.width;
        var y = (e.clientY - r.top - r.height / 2) / r.height;
        btn.style.transform = 'translate(' + (x * 10).toFixed(1) + 'px,' + (y * 7).toFixed(1) + 'px)';
      });
      btn.addEventListener('mouseleave', function(){ btn.style.transform = ''; });
    });
  }

  /* ---- spotlight cards ---- */
  if(fine && !reduce){
    document.querySelectorAll('.spot, .vid').forEach(function(card){
      card.addEventListener('mousemove', function(e){
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---- smooth FAQ ---- */
  document.querySelectorAll('.faq').forEach(function(d){
    var ans = d.querySelector('.ans');
    if(!ans) return;
    ans.style.overflow = 'hidden';
    ans.style.transition = 'height .35s cubic-bezier(.4,0,.2,1), opacity .3s ease';
    d.addEventListener('toggle', function(){
      if(d.open){
        ans.style.height = '0px';
        ans.style.opacity = '0';
        requestAnimationFrame(function(){
          requestAnimationFrame(function(){
            ans.style.height = ans.scrollHeight + 'px';
            ans.style.opacity = '1';
          });
        });
        setTimeout(function(){ if(d.open){ ans.style.height = 'auto'; } }, 400);
      } else {
        ans.style.height = ans.scrollHeight + 'px';
        requestAnimationFrame(function(){
          requestAnimationFrame(function(){
            ans.style.height = '0px';
            ans.style.opacity = '0';
          });
        });
      }
    });
  });

  /* ---- forms ---- */
  var toast = document.getElementById('toast');
  function handleForm(formId){
    var form = document.getElementById(formId);
    if(!form) return;
    var storeInput = form.querySelector('input[data-store]');
    if(storeInput){
      storeInput.addEventListener('input', function(){ storeInput.classList.remove('err'); });
    }
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var email = form.querySelector('input[type="email"]').value.trim();
      var store = storeInput ? storeInput.value.trim() : '';
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      var storeOk = /^(https?:\/\/)?[a-z0-9][a-z0-9-]*(\.[a-z0-9][a-z0-9-]*)+([\/?#]\S*)?$/i.test(store);
      if(!emailOk || !storeOk){
        if(!storeOk && storeInput){
          storeInput.classList.add('err');
          storeInput.focus();
        }
        toast.textContent = !storeOk ? 'Enter a valid store URL — like codemodeai.com' : 'Enter a valid email address';
        toast.classList.add('show');
        setTimeout(function(){
          toast.classList.remove('show');
          toast.textContent = "✓ You're on the list. We'll email you when your spot opens.";
        }, 3200);
        return;
      }
      if(!/^https?:\/\//i.test(store)){ store = 'https://' + store; }
      var SHEETS_URL = window.CAD_SHEETS_WEBAPP_URL;
      if(SHEETS_URL){
        fetch(SHEETS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ email: email, store: store, source: formId })
        }).then(function(r){ return r.json(); }).then(function(d){
          if(d && d.ok && d.count){
            var el = document.getElementById("up-position");
            if(el){ el.textContent = "You\u2019re #" + d.count + " in line"; }
          }
        }).catch(function(){});
      }
      toast.classList.add('show');
      setTimeout(function(){ toast.classList.remove('show'); }, 3800);
      form.reset();
      setTimeout(function(){ if(openSignup){ openSignup(); } }, 800);
    });
  }
  handleForm('form-top');
  handleForm('form-bottom');

  /* ---- copy code ---- */
  var cc = document.getElementById('copy-code');
  if(cc){
    cc.addEventListener('click', function(){
      var txt = document.getElementById('code-snippet').textContent;
      if(navigator.clipboard){ navigator.clipboard.writeText(txt); }
      cc.textContent = 'Copied';
      setTimeout(function(){ cc.textContent = 'Copy'; }, 1600);
    });
  }

  /* ---- play button ---- */
  var play = document.querySelector('.play');
  if(play){
    function playClick(){ toast.textContent = '▶ Video coming soon — join the waitlist to get notified.'; toast.classList.add('show'); setTimeout(function(){ toast.classList.remove('show'); toast.textContent = "✓ You're on the list. We'll email you when your spot opens."; }, 3200); }
    play.addEventListener('click', playClick);
    play.addEventListener('keydown', function(e){ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); playClick(); } });
  }

  /* ---- chat with your data sequence ---- */
  var chatbox = document.getElementById('chatbox');
  if(chatbox){
    var bubs = chatbox.querySelectorAll('.bub');
    var chatDone = false;
    function typeChat(span, bub, done){
      var text = span.getAttribute('data-type');
      var cur = bub.querySelector('.type-c2');
      if(bub.querySelector('.mini-bars')){ bub.classList.add('grow'); }
      var i = 0;
      (function tick(){
        if(i <= text.length){
          span.textContent = text.slice(0, i);
          i += 1;
          setTimeout(tick, 15);
        } else {
          if(cur){ cur.style.display = 'none'; }
          if(done){ done(); }
        }
      })();
    }
    function runChat(){
      if(chatDone) return; chatDone = true;
      var chain = Promise.resolve();
      bubs.forEach(function(b, idx){
        chain = chain.then(function(){
          return new Promise(function(res){
            setTimeout(function(){
              b.classList.add('seen');
              var t = b.querySelector('.bub-t');
              if(t){
                typeChat(t, b, function(){ setTimeout(res, 400); });
              } else {
                setTimeout(res, 420);
              }
            }, idx === 0 ? 350 : 0);
          });
        });
      });
    }
    if(reduce){
      bubs.forEach(function(b){
        var t = b.querySelector('.bub-t');
        var c = b.querySelector('.type-c2');
        if(t){ t.textContent = t.getAttribute('data-type'); }
        if(c){ c.style.display = 'none'; }
        if(b.querySelector('.mini-bars')){ b.classList.add('grow'); }
      });
    } else {
      bubs.forEach(function(b){
        var t = b.querySelector('.bub-t');
        if(t){ t.textContent = ''; }
      });
      chatbox.classList.add('pre');
      var chatIo = new IntersectionObserver(function(entries){
        entries.forEach(function(en){
          if(en.isIntersecting){ chatIo.unobserve(en.target); runChat(); }
        });
      }, {threshold:.3});
      chatIo.observe(chatbox);
    }
  }

  /* ---- demo overlay ---- */
  var demo = document.getElementById('demo');
  if(demo){
    var dchat = document.getElementById('dchat');
    var dchipsWrap = document.getElementById('dchips');
    var dform = document.getElementById('dform');
    var dtext = document.getElementById('dtext');
    var lastFocus = null;
    var answered = { when:false, dip:false, push:false };
    var ctaShown = false, busy = false;

    function openDemo(opener){
      lastFocus = opener || document.activeElement;
      demo.hidden = false;
      requestAnimationFrame(function(){ requestAnimationFrame(function(){ demo.classList.add('open'); }); });
      document.body.style.overflow = 'hidden';
      setTimeout(function(){ if(dtext){ dtext.focus(); } }, 380);
    }
    function closeDemo(){
      demo.classList.remove('open');
      document.body.style.overflow = '';
      setTimeout(function(){ demo.hidden = true; }, 320);
      if(lastFocus && lastFocus.focus){ lastFocus.focus(); }
    }
    document.getElementById('demo-open').addEventListener('click', function(){ openDemo(this); });
    var oa = document.getElementById('demo-open-agent');
    if(oa){ oa.addEventListener('click', function(){ openDemo(this); }); }
    var o2 = document.getElementById('demo-open-2');
    if(o2){ o2.addEventListener('click', function(){ openDemo(this); }); }
    document.getElementById('demo-close').addEventListener('click', closeDemo);
    document.getElementById('demo-backdrop').addEventListener('click', closeDemo);
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && !demo.hidden){ closeDemo(); }
    });

    function scrollChat(){ dchat.scrollTop = dchat.scrollHeight; }
    function addUser(text){
      var el = document.createElement('div');
      el.className = 'dbub u';
      el.textContent = text;
      dchat.appendChild(el);
      scrollChat();
    }
    function addTyping(){
      var el = document.createElement('div');
      el.className = 'dbub a';
      el.innerHTML = '<span class="dav">C</span><div class="dtx"><span class="typing"><i></i><i></i><i></i></span></div>';
      dchat.appendChild(el);
      scrollChat();
      return el;
    }
    function typeInto(bub, text, cardHTML, done){
      var tx = bub.querySelector('.dtx');
      if(reduce){
        tx.innerHTML = text + (cardHTML || '');
        if(done){ done(); }
        scrollChat();
        return;
      }
      var span = document.createElement('span');
      var cur = document.createElement('span');
      cur.className = 'type-c2';
      tx.innerHTML = '';
      tx.appendChild(span);
      tx.appendChild(cur);
      var i = 0;
      (function tick(){
        if(i <= text.length){
          span.textContent = text.slice(0, i);
          i += 1;
          scrollChat();
          setTimeout(tick, 13);
        } else {
          cur.style.display = 'none';
          if(cardHTML){ tx.insertAdjacentHTML('beforeend', cardHTML); scrollChat(); }
          if(done){ done(); }
        }
      })();
    }

    var QA = {
      when: {
        a: 'Most purchases happen Saturday 8–11 PM. That single window drives 34% of your weekly revenue — schedule your pushes around it.',
        card: '<div class="dcard"><div class="k">PURCHASES BY DAY</div><div class="dbars"><i style="height:30%"></i><i style="height:42%"></i><i style="height:36%"></i><i style="height:55%"></i><i style="height:48%"></i><i class="hot" style="height:92%"></i><i style="height:64%"></i></div><div class="dlbl"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div></div><span class="dstat hot">Sat 8–11 PM</span><span class="dstat">34% of weekly revenue</span>'
      },
      dip: {
        a: 'Product page exits are up 12% since Tuesday — mostly on mobile. The last thing visitors see before leaving is the shipping cost.',
        card: '<div class="dcard"><div class="k">CONVERSION TREND</div><div class="dline"><svg viewBox="0 0 200 44" preserveAspectRatio="none"><polyline points="0,16 30,12 60,18 90,10 115,38 145,26 175,14 200,10" fill="none" stroke="#ff7a72" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></polyline><circle cx="115" cy="38" r="4" fill="#ff3b30"></circle></svg></div></div><span class="dstat bad">Dip detected · Tuesday</span><span class="dstat">Fix: show delivery cost earlier</span>'
      },
      push: {
        a: "Your grey sneakers convert at 6.1% but get only 4% of your traffic. Push it — it's your best converter waiting for more visitors.",
        card: '<div class="dcard"><div class="k">PRODUCT OPPORTUNITY</div><div class="dprod"><span class="pi"><svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 2h5.2L14 8.8 8.8 14 2 7.2z" stroke="#e8e8ed" stroke-width="1.4" stroke-linejoin="round"/><circle cx="5.2" cy="5.2" r="1.1" fill="#e8e8ed"/></svg></span><div><b>Grey Sneakers</b><span>6.1% conversion · 4% of traffic</span></div><span class="pill2">PUSH THIS</span></div></div>'
      }
    };

    function markChips(){
      dchipsWrap.querySelectorAll('.dchip').forEach(function(ch){
        var k = ch.getAttribute('data-q');
        ch.classList.toggle('done', answered[k]);
      });
    }
    function maybeCTA(){
      if(ctaShown || !answered.when || !answered.dip || !answered.push){ return; }
      ctaShown = true;
      setTimeout(function(){
        var el = document.createElement('div');
        el.className = 'dbub a';
        el.innerHTML = '<span class="dav">C</span><div class="dtx">That\'s the demo — with your store connected, these answers come from your real data. Want this running on your store?<div class="dcta-row"><button type="button" class="btn btn-white" id="demo-join">Join the waitlist →</button></div></div>';
        dchat.appendChild(el);
        scrollChat();
        document.getElementById('demo-join').addEventListener('click', function(){
          closeDemo();
          setTimeout(function(){
            var w = document.getElementById('waitlist');
            if(w){ w.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }
          }, 380);
        });
      }, 700);
    }
    function respond(key){
      busy = true;
      dchipsWrap.classList.add('hide');
      var t = addTyping();
      setTimeout(function(){
        typeInto(t, QA[key].a, QA[key].card, function(){
          answered[key] = true;
          markChips();
          dchipsWrap.classList.remove('hide');
          busy = false;
          maybeCTA();
        });
      }, reduce ? 60 : 650);
    }

    dchipsWrap.addEventListener('click', function(e){
      var ch = e.target.closest('.dchip');
      if(!ch || busy){ return; }
      addUser(ch.textContent.replace(' ✓', '').trim());
      respond(ch.getAttribute('data-q'));
    });

    dform.addEventListener('submit', function(e){
      e.preventDefault();
      if(busy){ return; }
      var v = dtext.value.trim();
      if(!v){ return; }
      dtext.value = '';
      addUser(v);
      var lv = v.toLowerCase();
      var key = null;
      if(/(when|what time|hour|purchas|buy|checkout time)/.test(lv)){ key = 'when'; }
      else if(/(dip|drop|sales|leak|fall|down|exits|losing)/.test(lv)){ key = 'dip'; }
      else if(/(push|product|promote|stock|sell|advertis|market|traffic)/.test(lv)){ key = 'push'; }
      if(key){
        respond(key);
      } else {
        busy = true;
        dchipsWrap.classList.add('hide');
        var t = addTyping();
        setTimeout(function(){
          typeInto(t, "Good question — in the live product I'd answer that from your store's real data. This demo knows three things: try one of the questions below.", '', function(){
            dchipsWrap.classList.remove('hide');
            busy = false;
          });
        }, reduce ? 60 : 650);
      }
    });
  }

  /* ---- post-signup popup ---- */
  var uppop = document.getElementById('uppop');
  if(uppop){
    var upLast = null;
    openSignup = openUp;
    function setStep(n){
      document.getElementById('upd-1').classList.toggle('on', n === 1);
      document.getElementById('upd-2').classList.toggle('on', n === 2);
    }
    function openUp(){
      upLast = document.activeElement;
      var s1 = document.getElementById('up-step-1');
      var s2 = document.getElementById('up-step-2');
      s1.hidden = false; s1.classList.remove('leave');
      s2.hidden = true; s2.classList.remove('pre');
      setStep(1);
      uppop.hidden = false;
      requestAnimationFrame(function(){
        requestAnimationFrame(function(){ uppop.classList.add('open'); });
      });
      document.body.style.overflow = 'hidden';
    }
    function closeUp(){
      uppop.classList.remove('open');
      document.body.style.overflow = '';
      setTimeout(function(){ uppop.hidden = true; }, 320);
      if(upLast && upLast.focus){ upLast.focus(); }
    }
    document.getElementById('up-close').addEventListener('click', closeUp);
    document.getElementById('up-backdrop').addEventListener('click', closeUp);
    document.getElementById('up-no').addEventListener('click', closeUp);
    document.getElementById('up-later').addEventListener('click', closeUp);
    document.getElementById('up-yes').addEventListener('click', function(){
      var s1 = document.getElementById('up-step-1');
      var s2 = document.getElementById('up-step-2');
      s1.classList.add('leave');
      setTimeout(function(){
        s1.hidden = true;
        s1.classList.remove('leave');
        s2.hidden = false;
        s2.classList.add('pre');
        setStep(2);
        requestAnimationFrame(function(){
          requestAnimationFrame(function(){ s2.classList.remove('pre'); });
        });
        setTimeout(function(){
          var b = document.getElementById('up-book');
          if(b){ b.focus(); }
        }, 450);
      }, 240);
    });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && !uppop.hidden){ e.stopPropagation(); closeUp(); }
    });
    if(window.location.hash === '#popup'){
      setTimeout(openUp, 400);
    }
  }

  /* ---- mobile sticky CTA ---- */
  var mcta = document.getElementById('mcta');
  var heroForm = document.getElementById('form-top');
  var waitlist = document.getElementById('waitlist');
  if(mcta && heroForm && waitlist && 'IntersectionObserver' in window){
    var mIo = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.target === heroForm){
          mcta.classList.toggle('show', !en.isIntersecting);
        }
        if(en.target === waitlist){
          if(en.isIntersecting){ mcta.classList.remove('show'); }
          else if(heroForm.getBoundingClientRect().bottom < 0){ mcta.classList.add('show'); }
        }
      });
    }, {threshold: 0});
    mIo.observe(heroForm);
    mIo.observe(waitlist);
  }
})();
