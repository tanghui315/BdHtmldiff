/**
 * Created by tanghui on 2015/12/10.
 */
var  BdHtmldiff = {
    MODE_CHARACTER: 1,MODE_TAG: 2,MODE_WHITESPACE: 3,
    ACTION_EQUAL: 1,ACTION_DELETE: 2,ACTION_INSERT: 3,ACTION_NONE: 4,ACTION_REPLACE: 5,
    specialCaseOpeningTags: new Array('<strong[\\>\\s]+', '<b[\\>\\s]+', '<i[\\>\\s]+', '<big[\\>\\s]+', '<small[\\>\\s]+', '<u[\\>\\s]+', '<sub[\\>\\s]+', '<sup[\\>\\s]+', '<strike[\\>\\s]+', '<s[\\>\\s]+'),
    specialCaseClosingTags: new Array('</strong>', '</b>', '</i>', '</big>', '</small>', '</u>', '</sub>', '</sup>', '</strike>', '</s>'),
    content: '',
    wordIndices: '',
    oldWords: '',newWords: '',
    oldContent:'',
    newContent:'',
    oldOrNew:1,
    compare: function(str1, str2) {

        this.content = new Array();
        this.oldContent = new Array();
        this.newContent = new Array();
        this.wordIndices = new Array();
        this.oldWords = this.ConvertHtmlToListOfWords(str1);
        this.newWords = this.ConvertHtmlToListOfWords(str2);
        this.wordIndices = this.IndexNewWords(this.newWords);

        var b = this.Operations();
        return b;

    },
    blockCompare:function(oldHtml,newHtml){
        oldHtml=oldHtml.replace(/<a\s+href=['|"]['|"]\s+class=['|"]floor-edit-btn['|"]>[\W\w]+?<\/a>/,"");
        newHtml=newHtml.replace(/<a\s+href=['|"]['|"]\s+class=['|"]floor-edit-btn['|"]>[\W\w]+?<\/a>/,"");
        //第一块
        var oldObj=$($.parseHTML(oldHtml));
        var newObj=$($.parseHTML(newHtml));
        var headerOldHtml=oldObj.first()[0].outerHTML;
        var headerNewHtml=newObj.first()[0].outerHTML;
        var headerAct=this.compare(headerOldHtml,headerNewHtml);
        for (var c = 0; c < headerAct.length; c++) {
            var d = headerAct[c];
            this.PerformOperation(d);
        }
        var headOldhtml="<div class='divleft'>"+this.oldContent.join('')+"</div>";
        var headNewhtml="<div class='divright'>"+this.newContent.join('')+"</div>";
        var allContent="<div class='item-wrap'>"+headOldhtml+headNewhtml+"</div>";
        //第一块结束
        var oHtml1=oldObj.first().next().find('.floor-title');
        var nHtml1=newObj.first().next().find('.floor-title');
        var dmp = new diff_match_patch();
        var cpdata=[];
        var tmpTag=[];
        if((oHtml1.length==nHtml1.length)||(nHtml1.length>oHtml1.length) )
        {
            nHtml1.each(function(index,dom){
                // console.log($(dom).find(".title-text").text());
                var text1=$(dom).find(".title-text").text();
                //console.log(text1);
                oHtml1.each(function(index1,dom1){
                    var text2=$(dom1).find(".title-text").text();
                    console.log(text1+'--'+text2);
                    var diffs = dmp.diff_main(text2, text1);
                    console.log($(dom1).text());
                    if(tmpTag.indexOf($(dom1).text())!=-1)
                    {
                        return true;
                    }
                    if(diffs.length==1)
                    {
                        cpdata[index]={left:dom1,right:dom};
                        tmpTag.push($(dom1).text());
                        return false;
                    }
                    if(diffs.length>2)
                    {
                        cpdata[index]={left:dom1,right:dom};
                        // tmpTag.push($(dom1).text());
                        return true;
                    }
                });
                if (typeof(cpdata[index]) == "undefined")
                {
                    cpdata[index]={left:'',right:dom};
                }

            });

        }

        if(nHtml1.length<oHtml1.length)
        {
            oHtml1.each(function(index,dom){
                // console.log($(dom).find(".title-text").text());
                var text1=$(dom).find(".title-text").text();
                //console.log(text1);
                nHtml1.each(function(index1,dom1){
                    var text2=$(dom1).find(".title-text").text();
                    console.log(text1+'--'+text2);
                    var diffs = dmp.diff_main(text2, text1);
                    console.log(diffs.length);
                    if(tmpTag.indexOf($(dom1).text())!=-1)
                    {
                        return true;
                    }
                    if(diffs.length==1)
                    {
                        cpdata[index]={left:dom,right:dom1};
                        tmpTag.push($(dom1).text());
                        return false;
                    }
                    if(diffs.length>2)
                    {
                        cpdata[index]={left:dom,right:dom1};
                        return true;
                    }
                });
                if (typeof(cpdata[index]) == "undefined")
                {
                    cpdata[index]={left:dom,right:''};
                }

            });
        }

        // console.log(cpdata);
        var golabthis=this;
        var sContentAll=[];
        //console.log(cpdata);
        $.each(cpdata,function(index,obj){
            // $sContentAll.push("<div class='item-wrap'>");
            if(obj.left!="")
            {
                //  $sContentAll.push("<div class='divleft'>");
                var leftHtml=golabthis.getLeftRightHtml($(obj.left));
                //console.log(leftHtml);
                if(obj.right!="")
                {
                    var rightHtml=golabthis.getLeftRightHtml($(obj.right));
                    var sAct=golabthis.compare(leftHtml,rightHtml);
                    for (var c = 0; c < sAct.length; c++) {
                        var d = sAct[c];
                        golabthis.PerformOperation(d);
                    }
                    var tmpContent="<div class='item-wrap'>"+"<div class='divleft'>"+golabthis.oldContent.join('')+"</div>"+"<div class='divright'>"+golabthis.newContent.join('')+"</div>"+"</div>";
                    sContentAll.push(tmpContent);
                    // console.log(tmpContent);
                }else{
                    var tmpContent="<div class='item-wrap'>"+"<div class='divleft leftExist'>"+leftHtml+"</div>"+"<div class='divright rightNotExist'></div>"+"</div>";
                    sContentAll.push(tmpContent);
                }

                //   $sContentAll.push("</div>");
            }else{
                var rightHtml=golabthis.getLeftRightHtml($(obj.right));
                var tmpContent="<div class='item-wrap'>"+"<div class='divleft leftNotExist'></div>"+"<div class='divright rightExist'>"+rightHtml+"</div>"+"</div>";
                sContentAll.push(tmpContent);
            }


        });


        return allContent+sContentAll.join("");

    },
    getLeftRightHtml:function(lrDom)
    {
        var leftHtml=[];
        leftHtml.push(lrDom[0].outerHTML);
        //console.log(lrDom[0].outerHTML);
        lrDom.nextUntil('.floor-title').each(function(index,dom){
            leftHtml.push($(dom)[0].outerHTML);
        });
        return leftHtml.join('');
    },
    clearTagAction:function(action){
        for(var a=0;a<action.length;a++)
        {
            var act=action[a];
            if(act.Action==1){
                var v = this.array_slice(this.newWords, act.StartInNew, act.EndInNew);
                console.log(v.join(''));
            }
        }
    },
    Operations: function() {
        var d = 0;
        var j = 0;
        var a = new Array();
        var f = this.MatchingBlocks();
        // console.log(f);
        //console.log(this.Match(this.oldWords.length, this.newWords.length, 0));
        f.push(this.Match(this.oldWords.length, this.newWords.length, 0));
        // console.log(f);
        for (var i = 0; i < f.length; i++) {
            var g = f[i];
            var b = (d == g.StartInOld);
            var h = (j == g.StartInNew);
            var c = this.ACTION_NONE;
            if (b == false && h == false)
                c = this.ACTION_REPLACE;
            else {
                if (b == true && h == false)
                    c = this.ACTION_INSERT;
                else {
                    if (b == false && h == true)
                        c = this.ACTION_DELETE;
                    else
                        c = this.ACTION_NONE;
                }
            }
            if (c != this.ACTION_NONE)
            {
                a.push(this.Operation(c, d, g.StartInOld, j, g.StartInNew));//console.log(this.Operation(c, d, g.StartInOld, j, g.StartInNew));
            }
            if (g.length != 0)
                a.push(this.Operation(this.ACTION_EQUAL, g.StartInOld, g.EndInOld(), g.StartInNew, g.EndInNew()));
            d = g.EndInOld();
            j = g.EndInNew();
        }
        return a;
    },
    MatchingBlocks: function() {
        var a = new Array();
        this.FindMatchingBlocks(0, this.oldWords.length, 0, this.newWords.length, a);
        return a;
    },
    FindMatchingBlocks: function(c, oldLength, newLength, e, d) {
        var a = this.FindMatch(c, oldLength, newLength, e);
        if (a != null) {
            if (c < a.StartInOld && newLength < a.StartInNew)
                this.FindMatchingBlocks(c, a.StartInOld, newLength, a.StartInNew, d);
            d.push(a);
            if (a.EndInOld() < oldLength && a.EndInNew() < e)
                this.FindMatchingBlocks(a.EndInOld(), oldLength, a.EndInNew(), e, d);
        }
    },
    FindMatch: function(l, oldLength, newLength, k) {
        var f = l;
        var newLength1 = newLength;
        var n = 0;
        var c = new Array();
        for (var i = l; i < oldLength; i++) {
            var d = new Array();
            var h = this.oldWords[i];
            if (!this.wordIndices[h]) {
                c = d;
                continue;
            }
            for (var g = 0; g < this.wordIndices[h].length; g++) {
                var a = this.wordIndices[h][g];
                if (a < newLength) continue;
                if (a >= k) break;

                newMatchLength = (c[a - 1] ? c[a - 1] : 0) + 1;
                d[a] = newMatchLength;
                if (newMatchLength > n) {
                    f = i - newMatchLength + 1;
                    newLength1 = a - newMatchLength + 1;
                    n = newMatchLength;
                }
            }
            c = d;
        }
        return n != 0 ? this.Match(f, newLength1, n) : null;
    },
    IndexNewWords: function(d) {
        var b = new Array();
        for (var i = 0; i < d.length; i++) {
            var c = d[i];
            if (b[c])
                b[c].push(i);
            else
                b[c] = [i];
        }
        return b;
    },
    ConvertHtmlToListOfWords: function(b) {
        var f = this.MODE_CHARACTER;
        var e = '';
        var d = new Array();
        for (var i = 0; i < b.length; i++) {
            var c = b[i];
            switch (f) {
                case this.MODE_CHARACTER:
                    if (this.IsStartOfTag(c)) {
                        if (e){

                            d.push(e);
                        }

                        e = '<';
                        f = this.MODE_TAG;
                    } else {
                        if (this.IsWhiteSpace(c)) {
                            if (e)
                            {
                                d.push(e);

                            }

                            e = c;
                            f = this.MODE_WHITESPACE;
                        } else {
                            if (this.isNaW(e + c)) {
                                if (e)
                                {
                                    d.push(e);

                                }

                                e = c;
                            } else
                                e = e + c;
                        }
                    }
                    break;
                case this.MODE_TAG:
                    if (this.IsEndOfTag(c)) {
                        e = e + '>';
                        // console.log(e);
                        d.push(e);
                        e = '';
                        if (this.IsWhiteSpace(c))
                            f = this.MODE_WHITESPACE;
                        else
                            f = this.MODE_CHARACTER;
                    } else
                        e = e + c;
                    break;
                case this.MODE_WHITESPACE:
                    if (this.IsStartOfTag(c)) {
                        if (e)
                        {

                            d.push(e);
                        }

                        e = '<';
                        f = this.MODE_TAG;
                    } else {
                        if (this.IsWhiteSpace(c))
                            e = e + c;
                        else {
                            if (e)
                            {
                                d.push(e);
                            }

                            e = c;
                            f = this.MODE_CHARACTER;
                        }
                    }
                    break;
                default:
                    break;
            }
        }
        if (e)
            d.push(e);
        return d;
    },
    PerformOperation: function(a) {
        switch (a.Action) {
            case this.ACTION_EQUAL:
                this.ProcessEqualOperation(a);
                break;
            case this.ACTION_DELETE:
                this.ProcessDeleteOperation(a, 'diffdel');
                break;
            case this.ACTION_INSERT:
                this.ProcessInsertOperation(a, 'diffins');
                break;
            case this.ACTION_NONE:
                break;
            case this.ACTION_REPLACE:
                this.ProcessReplaceOperation(a);
                break;
            default:
                break;
        }
    },
    ProcessReplaceOperation: function(a) {
        this.ProcessDeleteOperation(a, 'diffmod');
        this.ProcessInsertOperation(a, 'diffmod');
    },
    ProcessInsertOperation: function(b, a) {
        //if(this.oldOrNew==2) {
        var c = this.array_slice(this.newWords, b.StartInNew, b.EndInNew);
        //console.log(c);
        this.InsertTag('ins', a, c);
        //}
    },
    ProcessDeleteOperation: function(b, a) {
        // if(this.oldOrNew==1) {
        var c = this.array_slice(this.oldWords, b.StartInOld, b.EndInOld);
        this.InsertTag('del', a, c);
        //  }
    },
    ProcessEqualOperation: function(b) {
        var a = this.array_slice(this.newWords, b.StartInNew, b.EndInNew);
        // console.log(a.join(''));
        this.oldContent.push(a.join(''));
        this.newContent.push(a.join(''));
        this.content.push(a.join(''));

    },
    preg_match_array: function(b, e) {
        var a = 0;
        for (var i = 0; i < b.length; i++)
            a |= (new RegExp(b[i])).test(e);
        return a;
    },
    InsertTag: function(j, h, f) {
        while (true) {
            if (f.length == 0) break;

            var b = this.ExtractConsecutiveWords(f, false);
            var c = b.items;

            f = b.words;
            //console.log(f);
            var a = '';
            var e = false;
            if (c.length != 0) {
                var g = this.WrapText(c.join(''), j, h);
                //console.log(g);
                if(j=='del')
                {
                    this.oldContent.push(g);
                }
                if(j=='ins'){
                    this.newContent.push(g);
                }
                this.content.push(g);
            } else {
                if ( !! this.preg_match_array(this.specialCaseOpeningTags, f[0])) {
                    a = '<ins class="mod">';
                    if (j == 'del')
                        f.shift();
                } else {
                    if (this.in_array(f[0], this.specialCaseClosingTags)) {
                        a = '</ins>';
                        e = true;
                        if (j == 'del')
                            f.shift();
                    }
                }
            }
            if (f.length == 0 && a.length == 0) break;
            if (e) {
                var d = this.ExtractConsecutiveWords(f, true);
                f = d.words;
                //console.log(a + d.items.join(''));
                if(j=='del')
                {
                    this.oldContent.push(a + d.items.join(''));
                }
                if(j=='ins'){
                    this.newContent.push(a + d.items.join(''));
                }
                this.content.push(a + d.items.join(''));
            } else {
                var d = this.ExtractConsecutiveWords(f, true);
                // console.log(d.items.join(''));
                if(j=='del')
                {
                    this.oldContent.push(d.items.join('') + a);
                }
                if(j=='ins'){
                    this.newContent.push(d.items.join('') + a);
                }
                f = d.words;
                this.content.push(d.items.join('') + a);
            }
        }
    },
    in_array: function(b, c) {
        for (var i = 0; i < c.length; i++) {
            if (c[i] == b)
                return true;
        }
        return false;
    },
    WrapText: function(c, b, a) {
        return '<' + b + ' class="' + a + '">' + c + '</' + b + '>';
    },
    ExtractConsecutiveWords: function(d, f) {
        var e = false;

        for (var b = 0; b < d.length; b++) {
            var c = d[b];
            if (f ? !this.IsTag(c) : !!this.IsTag(c)) {
                e = b;
                break;
            }
        }
        if (e !== false) {
            var a = this.array_slice(d, 0, e);
            //console.log(a);
            if (e > 0)
                d.splice(0, e);
            return {items: a,words: d};
        } else {
            a = d;
            // console.log(a);
            d = new Array();
            return {items: a,words: d};
        }
    },
    IsTag: function(b) {
        var a = this.IsOpeningTag(b) || this.IsClosingTag(b);
        return a;
    },
    IsOpeningTag: function(a) {
        return /^\s*<[^>]+>\s*$/.test(a);
    },
    IsClosingTag: function(a) {
        return /^\s*<\/[^>]+>\s*$/.test(a);
    },
    IsStartOfTag: function(a) {
        return a == "<";
    },
    IsEndOfTag: function(a) {
        return a == ">";
    },
    IsWhiteSpace: function(a) {
        return /\s/.test(a);
    },
    isNaW: function(b) {
        return /[^\x00-\x80]/.test(b);
    },
    array_slice: function(a, b, c, d) {
        return a.slice(b, c);
    },
    Match: function(b, d, a) {
        var c = {
            StartInOld: b,
            StartInNew: d,
            Size: a
        };
        c.EndInOld = function() {
            return b + a;
        };
        c.EndInNew = function() {
            return d + a;
        };
        return c;
    },
    Operation: function(c, b, a, f, d) {
        var e = {
            Action: c,
            StartInOld: b,
            EndInOld: a,
            StartInNew: f,
            EndInNew: d
        };
        return e;
    }
};