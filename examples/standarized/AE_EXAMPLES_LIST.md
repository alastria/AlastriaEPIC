* AE00: **Tech**                                    
  * AE0000: **Proof of Tech**                       (old: AE00)                 `Depends: None`
* AE01: **Identity**                                
  * AE0101: **Indentity Creation**                  (old: AE01)                 `Depends: None`
  * AE0102: **Additional Network Creation**         (old: AE02)                 `Depends: AE0101`
  * AE0103: **Subject Identity Rotation**           (old: AE13)                 `Depends: AE0101`                   
  * AE0104: **Entity Identity Rotation**            (old: AE14)                 `Depends: AE0101`                   
* AE02: **OnBoarding**    
  * AE0201: **Subject-Entity Mutual OnBoarding**    (old: AE03, AE03B)          `Depends: AE0101`
  * AE0202: **Subject OnBoarding Rotation**         (old: AE12)                 `Depends: AE0101`
* AE03: **Login**         
  * AE0301: **Subject-Entity Login Creation**       (old: AE04_01)              `Depends: AE0201`
  * AE0302: **Subject Login**                       (old: AE04)                 `Depends: AE0301`
  * AE0303: **Subject Login Rotation**              (old: AE05)                 `Depends: AE0301`
* AE04: **Credentials**   
  * AE0401: **Credential Issuance**                 (old: AE06, AE06, AE06C)    `Depends: AE0201`
  * AE0402: **Subject Credential Revocation**       (old: AE07)                 `Depends: AE0401`
  * AE0403: **Issuer Credential Revocation**        (old: AE08)                 `Depends: AE0401`
* AE05: **Presentations** 
  * AE0501: **Subject Credential Presentation**     (old: AE09)                 `Depends: AE0401`
  * AE0502: **Subject Presentation Revocation**     (old: AE10)                 `Depends: AE0501`
  * AE0503: **Relying Party Presentation Deletion** (old: AE11)                 `Depends: AE0501`
